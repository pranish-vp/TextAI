require("dotenv").config();
var admin = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const OpenAI = require("openai");


const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});
const firestore = admin.firestore();

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
            content: userPrompt,
        });

        const assistants = await openai.beta.assistants.retrieve('asst_j3IEiKIodvO6Y6UU3o8koXlc');

        var run = await openai.beta.threads.runs.create(
            threadId,
            { assistant_id: assistants.id }
        );

        while (run.status != 'completed') {
            await new Promise(r => setTimeout(r, 2000));
            run = await openai.beta.threads.runs.retrieve(
                threadId, run.id);
        }
        console.log(run.status);
        const msg = await openai.beta.threads.messages.list(threadId);
        /* const new_msg = msg.data[0].content[0].text.value; */
        console.log(msg.body.data[0].content[0].text.value);
        return msg.body.data[0].content[0].text.value;
    }
    catch {
        console.log("Wait for the last request");
    }
}

module.exports = { threadOpen };