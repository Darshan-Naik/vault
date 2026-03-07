export function initAutosave() {
    document.addEventListener("submit", (e) => {
        const form = e.target as HTMLFormElement;
        if (!form) return;

        const passwordInputs = Array.from(form.querySelectorAll("input[type='password']")) as HTMLInputElement[];
        if (passwordInputs.length > 0) {
            const password = passwordInputs[0].value;
            if (!password) return;

            let username = "";
            const textInputs = Array.from(form.querySelectorAll("input[type='text'], input[type='email']")) as HTMLInputElement[];
            if (textInputs.length > 0) {
                username = textInputs[0].value;
            }

            if (password) {
                chrome.runtime.sendMessage({
                    action: "OPEN_SAVE_POPUP",
                    hostname: window.location.hostname,
                    payload: {
                        title: document.title || window.location.hostname,
                        uid: username,
                        password: password,
                        url: window.location.href,
                        type: "CREDENTIAL"
                    }
                });
            }
        }
    });
}
