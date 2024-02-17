import UpdateUserProfile from "../../src/tools/UpdateUserProfile";

describe('UpdateUserProfile tool', () => {
    let tool: UpdateUserProfile;

    beforeAll(() => {
        tool = new UpdateUserProfile();
    });

    it('should update the profile', async () => {
        const result = await tool.handle({
            profile: "test"
        });

        console.log(result);

        expect(result).toContain("CV");
    }, 10000)

});