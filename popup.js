document.addEventListener("DOMContentLoaded", () => {
    const entriesDiv = document.getElementById("entries");
    const downloadBtn = document.getElementById("downloadBtn");
    const clearBtn = document.getElementById("clearBtn");

    // Kayıtlı verileri göster
    function loadEntries() {
        chrome.storage.local.get("entries", (data) => {
            const entries = data.entries || [];
            entriesDiv.innerHTML = '';
            
            if (entries.length === 0) {
                entriesDiv.innerHTML = '<div class="entry">Henüz kayıt yok</div>';
                return;
            }

            entries.forEach((entry) => {
                const div = document.createElement('div');
                div.className = 'entry';
                div.innerHTML = `
                    <strong>Başlık:</strong> ${entry.title || 'Yok'}<br>
                    <strong>Açıklama:</strong> ${entry.description || 'Yok'}
                `;
                entriesDiv.appendChild(div);
            });
        });
    }

    // JSON indirme
    downloadBtn.addEventListener("click", () => {
        chrome.storage.local.get("entries", (data) => {
            const entries = data.entries || [];
            if (entries.length === 0) {
                alert('İndirilecek kayıt bulunamadı!');
                return;
            }

            const jsonStr = JSON.stringify(entries, null, 4);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const date = new Date().toISOString().split('T')[0];
            chrome.downloads.download({
                url: url,
                filename: `kayitlar_${date}.json`,
                saveAs: true
            });
        });
    });

    // Tüm verileri silme
    clearBtn.addEventListener("click", () => {
        chrome.storage.local.get("entries", (data) => {
            const entries = data.entries || [];
            if (entries.length === 0) {
                alert('Silinecek kayıt bulunamadı!');
                return;
            }

            if (confirm('Tüm kayıtlar silinecek. Emin misiniz?')) {
                chrome.storage.local.set({ entries: [] }, () => {
                    loadEntries();
                });
            }
        });
    });

    // İlk yüklemede ve her popup açılışında verileri yenile
    loadEntries();
});
