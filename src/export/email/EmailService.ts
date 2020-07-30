import axios from "axios";

export interface EmailConfiguration {
    sendToKindleEmail?: boolean
    kindleEmail: string
}

export class EmailConfigurationMissingError extends Error {
}

class _EmailService {

    async sendClippings(fileName: string, content: string, config: EmailConfiguration) {
        const payload = {...config, fileName, content}
        return axios
            .post<void>(process.env.REACT_APP_EMAIL_URL, payload)
            .then()
            .catch(error => {
                console.log(error);
                let message;
                if (!error.response)
                    message = "Couldn't connect to server";
                else if (error.response.status === 400) {
                    message = error.response.data
                } else if (error.response.status === 404) {
                    message = "Server not found";
                } else if (error.response.status === 504) {
                    message = "Unexpected error";
                } else {
                    message = "Unknown error";
                }
                throw new Error(message);
            });
    }
}

export const EmailService = new _EmailService();