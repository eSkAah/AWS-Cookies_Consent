

export const handler = async (event: any = {},): Promise<any> => {

    const body = JSON.parse(event.body);

    return {
        statusCode: 200,
        body: "HELLO WORLD WE GET",
    };
};
