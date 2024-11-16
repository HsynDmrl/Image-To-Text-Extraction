// axios ve fs modülleri dahil ediliyor. 
// axios: HTTP istekleri göndermek için kullanılır.
// fs: Dosya sistemi işlemleri için kullanılır.
const axios = require("axios");
const fs = require("fs");

// .env dosyasındaki değişkenleri yüklemek için dotenv modülü dahil ediliyor.
// Bu, uygulama yapılandırmalarını çevresel değişkenlerden okumamıza olanak tanır.
require("dotenv").config();

// Bilgisayar Görü ile analiz API'si için gerekli endpoint ve API anahtarı çevresel değişkenlerden alınıyor.
// Endpoint: Bilgisayar Görü hizmetinin temel URL'si.
// API Anahtarı: Yetkilendirme için gerekli gizli anahtar.
const endpoint = process.env.COMPUTER_VISION_ENDPOINT;
const apiKey = process.env.COMPUTER_VISION_API_KEY;

/**
 * Bir resim dosyasından metin çıkaran bir asenkron işlev.
 * 
 * @param {string} filePath - Analiz edilecek görüntü dosyasının yolu.
 */
async function extractTextFromImage(filePath) {
    // Bilgisayar Görü API'sinin metin çıkarma özelliği için URL oluşturuluyor.
    const url = `${endpoint}/computervision/imageanalysis:analyze?features=read&api-version=2024-02-01`;

    // Resim dosyasını ikili veri (binary) formatında okuyarak gönderime hazırlanıyor.
    const imageData = fs.readFileSync(filePath);

    try {
        // API'ye POST isteği gönderiliyor.
        // imageData: Ham görüntü verisi.
        // Headers: API anahtarı ve veri tipi belirtiliyor.
        const response = await axios.post(
            url,
            imageData,
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": apiKey,
                    "Content-Type": "application/octet-stream",
                },
            }
        );

        // Yanıt verisi kontrol ediliyor ve metin çıkarma işlemi yapılıyor.
        if (response.data && response.data.readResult) {
            let extractedText = ""; // Çıkarılan metinleri tutmak için boş bir değişken.

            // Metin blokları arasında geziliyor.
            response.data.readResult.blocks.forEach(block => {
                // Her bir bloktaki satırlar birleştiriliyor.
                block.lines.forEach(line => {
                    extractedText += line.text + " ";
                });
            });

            // Çıkarılan metin konsola yazdırılıyor.
            console.log("Çıkarılan Metin:", extractedText.trim());
        } else {
            // Eğer herhangi bir metin algılanmazsa kullanıcı bilgilendiriliyor.
            console.error("Hiçbir metin algılanamadı.");
        }
    } catch (error) {
        // İstek sırasında oluşan hatalar konsola yazdırılıyor.
        console.error("Hata oluştu:", error.response?.data || error.message);
    }
}

// Yerel bir dosya yolu ile işlev test ediliyor.
// Bu örnekte 'notes.jpg' aynı dizinde yer alan bir görüntü dosyası.
const testImagePath = "./notes.jpg";
extractTextFromImage(testImagePath);
