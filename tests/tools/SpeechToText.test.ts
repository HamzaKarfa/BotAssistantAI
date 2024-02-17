import SpeechToText from "../../src/tools/SpeechToText";

describe('SpeechToText tool', () => {
    let speechToText: SpeechToText;

    beforeAll(() => {
        speechToText = new SpeechToText();
    });

    it('should return the text of an audio file', async () => {
        const result = await speechToText.handle({
            url: "https://cdn.discordapp.com/attachments/1112505733934747648/1201258909457981600/voice-message.ogg?ex=65c92a8a&is=65b6b58a&hm=8d453c149229321ea43e74f27346e0ae79763bc24f352f7b1e5d4678d2af0f26"
        });

        console.log(result);

        expect(result).toContain("Test audio 1, 2, 3");
    }, 45000)
});