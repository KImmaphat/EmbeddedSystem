// ตัวแปรสถานะไมโครโฟน
let micOn = false;
let notifications = [];
let notificationCount = 0;

// อ้างอิง DOM Elements
const esp32Url = "http://192.168.1.100"; // IP ของ ESP32
const notificationBell = document.getElementById("notificationBell");
const notificationList = document.getElementById("notificationList");
const notificationsContainer = document.getElementById("notifications");
const notificationCountElement = document.getElementById("notificationCount");
const captureBtn = document.getElementById("captureBtn");
const micToggle = document.getElementById("micToggle");

// ฟังก์ชันเปิด/ปิดไมค์
micToggle.addEventListener("click", () => {
    micOn = !micOn;
    if (micOn) {
        micToggle.textContent = "Mic On";
        micToggle.classList.remove("off");
        micToggle.classList.add("on");
        sendToESP32("mic_on");
    } else {
        micToggle.textContent = "Mic Off";
        micToggle.classList.remove("on");
        micToggle.classList.add("off");
        sendToESP32("mic_off");
    }
});

// ฟังก์ชันส่งข้อมูลไปยัง ESP32
function sendToESP32(command) {
    fetch(`${esp32Url}/control`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: command }),
    })
    .then((response) => {
        if (response.ok) {
            console.log("Command sent successfully!");
        } else {
            console.error("Failed to send command.");
        }
    })
    .catch((error) => console.error("Error:", error));
}

// ฟังก์ชันจับภาพจากกล้อง
captureBtn.addEventListener("click", () => {
    const cameraFeed = document.getElementById("cameraFeed");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // ตั้งค่าขนาดของ Canvas ให้เท่ากับภาพกล้อง
    canvas.width = cameraFeed.naturalWidth;
    canvas.height = cameraFeed.naturalHeight;

    // วาดภาพจาก <img> ลงใน Canvas
    context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

    // แปลง Canvas เป็น Blob และสร้างลิงก์ดาวน์โหลด
    canvas.toBlob((blob) => {
        const downloadLink = document.createElement("a");
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "capture.png";
        downloadLink.click();
        URL.revokeObjectURL(url); // ลบ URL หลังใช้งาน
    });
});

// ฟังก์ชันเพิ่มแจ้งเตือนใหม่
function addNotification(message) {
    notifications.push(message);
    notificationCount++;
    notificationCountElement.textContent = notificationCount;

    const listItem = document.createElement("li");
    listItem.textContent = message;
    notificationsContainer.appendChild(listItem);
}

// ฟังก์ชันเปิด/ปิดการแสดงประวัติการแจ้งเตือน
notificationBell.addEventListener("click", () => {
    notificationList.style.display =
        notificationList.style.display === "none" || notificationList.style.display === ""
            ? "block"
            : "none";
});

// ฟังก์ชันดึงข้อมูลแจ้งเตือนจาก ESP32
function fetchNotifications() {
    fetch(`${esp32Url}/notifications`)
        .then((response) => response.json())
        .then((data) => {
            data.forEach((notification) => {
                addNotification(notification);
            });
        })
        .catch((error) => console.error("Error fetching notifications:", error));
}

// จำลองการแจ้งเตือน (สำหรับทดสอบ)
setInterval(() => {
    const fakeNotification = `Sensor Alert at ${new Date().toLocaleTimeString()}`;
    addNotification(fakeNotification);
}, 10000);

// ดึงข้อมูลแจ้งเตือนทุก 15 วินาที
setInterval(fetchNotifications, 15000);