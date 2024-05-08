require("dotenv").config();
var admin = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const OpenAI = require("openai");
const { getJson } = require("serpapi");


const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});
const firestore = admin.firestore();

async function searchGoogle(args) {
    console.log(args)
    const location = args.location? args.location : 'India';
    const gl = args.gl? args.gl : 'in';
    const res = await getJson({
        engine: "google",
        q: args.q,
        location: location,
        gl:gl,
        api_key: process.env.SERP_API,
      });
      return res["organic_results"];
}

async function searchTrends(args) {
    console.log(args)
    const res = await getJson({
        engine: "google_trends",
        q: args.q,
        api_key: process.env.SERP_API,
      });
      return res["interest_over_time"];
}

async function threadOpen(userPrompt, emailid) {
    try {
        var flag = -1;
        var docid;
        const ref = firestore.collection('threads');
        const snapshot = await ref.get();
        snapshot.forEach(doc => {
            if (emailid == doc.data().emailid) {
                flag = 0;
                docid = doc.id;
            }
        });
        var threadId;
        if (flag == -1) {
            //create new thread
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
            const data = {
                "emailid": emailid,
                "threadid": threadId
            }
            const res = await firestore.collection('threads').add(data);
            console.log("new");
        }
        else {
            //use existing thread
            const docref = firestore.collection('threads').doc(docid);
            const doc = await docref.get();
            threadId = doc.data().threadid;
            console.log("existing");
        }

        const message = await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: userPrompt
        });

        const assistants = await openai.beta.assistants.retrieve('asst_oNyeuXCAkgHbDbqOTwnL2vng');

        var run = await openai.beta.threads.runs.create(
            threadId,
            { assistant_id: assistants.id }
        );
        console.log(run.status);
        while (run.status != 'requires_action' && run.status !=  'completed') {
            await new Promise(r => setTimeout(r, 2000));
            run = await openai.beta.threads.runs.retrieve(
                threadId, run.id);
            console.log(run.status);
        }
        const runid = run.id;
        console.log(run.status);
        console.log(process.env.SERP_API);
        if (run.status == 'requires_action' ) {
            var tooloutputs = [];
            const availableFunctions = {
                search_google: searchGoogle,
                search_trends: searchTrends,
            };
            const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

            for (const toolCall of toolCalls) {
                const toolid = toolCall.id;
                const functionName = toolCall.function.name;
                const functionToCall = availableFunctions[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);
                let functionResponse = await functionToCall(
                    functionArgs
                );
                tooloutputs.push({
                    tool_call_id: toolid,
                    output: JSON.stringify(functionResponse)
                })
            }
            run = await openai.beta.threads.runs.submitToolOutputs(
                threadId,
                runid,
                {
                    tool_outputs: tooloutputs
                }
            );
        }
        while (run.status != 'completed') {
            await new Promise(r => setTimeout(r, 500));
            run = await openai.beta.threads.runs.retrieve(
                threadId, run.id);
            console.log(run.status);
        }
        console.log(run.status);
        const msg = await openai.beta.threads.messages.list(threadId);
        return msg.body.data[0].content[0].text.value;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = { threadOpen };