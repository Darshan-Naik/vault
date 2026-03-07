function createPromptContainer() {
    let container = document.getElementById('vault-extension-prompt-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'vault-extension-prompt-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '999999999',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });
        document.body.appendChild(container);
    }
    return container;
}

export function showSavePrompt(payload: any) {
    const container = createPromptContainer();
    const prompt = document.createElement('div');
    Object.assign(prompt.style, {
        backgroundColor: '#171717',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '320px',
        border: '1px solid #262626'
    });

    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.fontSize = '16px';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '8px';
    title.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save to Vault`;

    const desc = document.createElement('div');
    desc.style.fontSize = '14px';
    desc.style.color = '#a3a3a3';
    desc.innerText = `Save login for ${payload.title}?`;

    const emailRow = document.createElement('div');
    Object.assign(emailRow.style, {
        fontSize: '13px',
        color: '#e5e5e5',
        backgroundColor: '#262626',
        padding: '6px 10px',
        borderRadius: '4px'
    });
    emailRow.innerText = payload.uid || '(No username found)';

    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '4px'
    });

    const dismissBtn = document.createElement('button');
    dismissBtn.innerText = 'Not Now';
    Object.assign(dismissBtn.style, {
        padding: '6px 14px',
        border: '1px solid #404040',
        backgroundColor: '#262626',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    });
    dismissBtn.onclick = () => prompt.remove();

    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save Password';
    Object.assign(saveBtn.style, {
        padding: '6px 14px',
        border: 'none',
        backgroundColor: '#059669',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    });
    saveBtn.onclick = () => {
        chrome.runtime.sendMessage({
            action: "SAVE_CREDENTIAL",
            payload: payload
        });
        prompt.remove();
    };

    buttonRow.appendChild(dismissBtn);
    buttonRow.appendChild(saveBtn);

    prompt.appendChild(title);
    prompt.appendChild(desc);
    prompt.appendChild(emailRow);
    prompt.appendChild(buttonRow);
    container.appendChild(prompt);
}

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
                showSavePrompt({
                    title: window.location.hostname,
                    uid: username,
                    password: password,
                    url: window.location.href,
                    type: "CREDENTIAL"
                });
            }
        }
    });
}
