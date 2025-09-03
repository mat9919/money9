// จัดการข้อมูลใน localStorage
const STORAGE_KEY = "personal_finance_data";

function getData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    income: 0,
    expenses: {}
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// อัปเดตหน้าจอ
function updateSummary() {
  const data = getData();
  const totalIncome = data.income || 0;
  const totalExpense = Object.values(data.expenses).reduce((a, b) => a + b, 0);

  document.getElementById("total-income").textContent = totalIncome.toFixed(2) + " บาท";
  document.getElementById("total-expense").textContent = totalExpense.toFixed(2) + " บาท";
  document.getElementById("balance").textContent = (totalIncome - totalExpense).toFixed(2) + " บาท";
}

// แสดงโมเดล
function showModal(title, callback) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("amount-input").value = "";
  document.getElementById("modal").classList.remove("hidden");
  window.modalCallback = callback;
}

// ปิดโมเดล
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// บันทึกข้อมูล
function recordTransaction(type, amount, subType = null) {
  const data = getData();
  amount = parseFloat(amount);

  if (isNaN(amount) || amount <= 0) return;

  if (type === "income") {
    data.income += amount;
  } else if (type === "expense") {
    const key = subType || "other";
    data.expenses[key] = (data.expenses[key] || 0) + amount;
  }

  saveData(data);
  updateSummary();
  showToast();
  closeModal();
}

// แสดงแจ้งเตือน
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  updateSummary();

  // เมนูรายรับ
  document.querySelectorAll(".btn-income").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      let title = "ระบุจำนวนเงิน (รายรับ)";
      showModal(title, (amount) => {
        recordTransaction("income", amount);
      });
    });
  });

  // เมนูรายจ่าย
  document.querySelectorAll(".btn-expense").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;

      if (type === "credit_card") {
        document.querySelector(".submenu-credit").classList.toggle("hidden");
      } else if (type === "shopee_paylater") {
        document.querySelector(".submenu-shopee").classList.toggle("hidden");
      } else {
        const label = btn.textContent.trim();
        showModal(`ระบุจำนวนเงิน (${label})`, (amount) => {
          recordTransaction("expense", amount, type);
        });
      }
    });
  });

  // เลือกบัตรเครดิต
  document.querySelectorAll(".card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.dataset.card;
      const label = btn.textContent;
      showModal(`จ่ายบัตร: ${label}`, (amount) => {
        recordTransaction("expense", amount, `credit_${card}`);
      });
    });
  });

  // เลือก Shopee PayLater
  document.querySelectorAll(".shopee-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const service = btn.dataset.shopee;
      const label = btn.textContent;
      showModal(`ชำระ: ${label}`, (amount) => {
        recordTransaction("expense", amount, `shopee_${service}`);
      });
    });
  });

  // ปุ่มรวม
  document.getElementById("btn-total-income").addEventListener("click", () => {
    alert(`รวมรายรับ: ${getData().income.toFixed(2)} บาท`);
  });

  document.getElementById("btn-total-expense").addEventListener("click", () => {
    const expenses = getData().expenses;
    let msg = "รายละเอียดรายจ่าย:\n";
    for (let [key, val] of Object.entries(expenses)) {
      msg += `${key}: ${val.toFixed(2)} บาท\n`;
    }
    msg += `\nรวม: ${Object.values(expenses).reduce((a,b) => a+b, 0).toFixed(2)} บาท`;
    alert(msg);
  });

  // ปุ่มล้างข้อมูล
  document.getElementById("clear-data").addEventListener("click", () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด?")) {
      localStorage.removeItem(STORAGE_KEY);
      updateSummary();
      document.querySelector(".submenu-credit").classList.add("hidden");
      document.querySelector(".submenu-shopee").classList.add("hidden");
      showToast();
    }
  });

  // ปุ่มยืนยัน / ยกเลิก ในโมเดล
  document.getElementById("confirm-btn").addEventListener("click", () => {
    const amount = document.getElementById("amount-input").value;
    if (window.modalCallback && amount) {
      window.modalCallback(amount);
    }
  });

  document.getElementById("cancel-btn").addEventListener("click", closeModal);

  // เปลี่ยนช่วงเวลา (ยังไม่ใช้งานจริง ใช้แสดงเท่านั้น)
  document.querySelectorAll(".btn-period").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".btn-period").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      alert(`แสดงข้อมูล ${this.dataset.period === 'month' ? 'ประจำเดือน' : 'ประจำปี'}`);
    });
  });
});
