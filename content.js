(() => {
    let lastEntry = null;

    document.addEventListener("keydown", (event) => {
        // Input veya textarea içindeyken çalışmasın
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        let selectedText = window.getSelection().toString().trim();
        if (!selectedText) return;

        if (event.key === "t" || event.key === "d") {
            chrome.runtime.sendMessage({
                action: "addEntry",
                type: event.key === "t" ? "title" : "description",
                text: selectedText
            }, (response) => {
                if (response && response.success) {
                    showNotification(event.key === 't' ? 'Başlık' : 'Açıklama');
                }
            });
        }
    });

    function showNotification(type) {
        const notification = document.createElement('div');
        notification.textContent = `${type} kaydedildi`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
})();
