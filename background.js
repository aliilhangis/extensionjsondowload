let currentFilePath = '';

chrome.runtime.onInstalled.addListener(() => {
    console.log("JSON Kaydedici eklentisi yüklendi!");
    // Başlangıçta boş bir entries array'i oluştur
    chrome.storage.local.set({ entries: [] });
});

// Dosya okuma ve yazma işlemleri için
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveData") {
        try {
            const { savedData } = request;
            
            if (!currentFilePath) {
                sendResponse({ success: false, error: "Dosya seçilmedi" });
                return;
            }

            // Mevcut JSON dosyasını oku ve güncelle
            fetch('file://' + currentFilePath)
                .then(response => response.json())
                .catch(() => ({}))
                .then(existingData => {
                    // Verileri birleştir
                    const updatedData = {
                        ...existingData,
                        ...savedData
                    };

                    // JSON dosyasını oluştur
                    const blob = new Blob([JSON.stringify(updatedData, null, 2)], {
                        type: 'application/json'
                    });

                    // Dosyayı kaydet
                    chrome.downloads.download({
                        url: URL.createObjectURL(blob),
                        filename: currentFilePath.split(/[\/\\]/).pop(),
                        conflictAction: 'overwrite',
                        saveAs: false
                    }, (downloadId) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ success: true });
                        }
                    });
                });

            return true; // asenkron sendResponse için
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    if (request.action === "setFilePath") {
        currentFilePath = request.filePath;
        sendResponse({ success: true });
    }

    if (request.action === "addEntry") {
        chrome.storage.local.get("entries", (data) => {
            let entries = data.entries || [];
            
            // Son kaydı kontrol et
            let lastEntry = entries[entries.length - 1];
            
            if (request.type === "title") {
                // Yeni başlık için yeni kayıt
                entries.push({ title: request.text });
            } else if (request.type === "description") {
                if (lastEntry && !lastEntry.description) {
                    // Son kayda açıklama ekle
                    lastEntry.description = request.text;
                    entries[entries.length - 1] = lastEntry;
                } else {
                    // Yeni kayıt (sadece açıklama ile)
                    entries.push({ description: request.text });
                }
            }
            
            chrome.storage.local.set({ entries }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    }
});


