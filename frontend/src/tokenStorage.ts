export const storeToken = (tokenAsObject: any): void => {
    console.log("storeToken called with:", tokenAsObject);
    console.log("saving:", tokenAsObject.accessToken);

    localStorage.setItem("token_data", tokenAsObject.accessToken);

    console.log("localStorage now:", localStorage.getItem("token_data"));
}

export const retrieveToken = (): string | null => {
    const token = localStorage.getItem("token_data");
    console.log("retrieveToken:", token);
    return token;
}