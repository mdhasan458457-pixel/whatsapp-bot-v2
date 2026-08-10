const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false
        });

        const phoneNumber = "8801616858067";

        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n=================================\n👉 আপনার Pairing Code: ${code}\n=================================\n`);
                } catch (err) {
                    console.log("Pairing Code ত্রুটি:", err.message);
                }
            }, 4000);
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    connectToWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('✅ হোয়াটসঅ্যাপ সফলভাবে কানেক্ট হয়েছে!');
            }
        });

    } catch (error) {
        console.error("ত্রুটি:", error.message);
    }
}

connectToWhatsApp();
