// --- ส่วนที่ 1: ตั้งค่าการเชื่อมต่อกับ Supabase ---
const SUPABASE_URL = 'https://fipsalpfzrqnashdimqi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHNhbHBmenJxbmFzaGRpbXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODQ0MjQsImV4cCI6MjA3MjY2MDQyNH0.lhs3PlCdz5kmO8xm7F_w93eT-0v2Sp-BZRxbLyAWCDc';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ส่วนที่ 2: ฟังก์ชันสำหรับบันทึกข้อมูล ---
async function saveSchedule(event) {
    event.preventDefault(); // ป้องกันไม่ให้ฟอร์มรีเฟรชหน้า

    const employeeId = document.getElementById('employee-id').value;
    const employeeName = document.getElementById('employee-name').value;
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!employeeId || !employeeName || !date || !status) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    // สร้าง object ข้อมูลที่จะส่งไป Supabase
    const scheduleData = {
        employee_id: employeeId,
        employee_name: employeeName,
        date: date,
        status: status
    };

    // ส่งข้อมูลไปที่ตารางชื่อ 'schedules'
    const { data, error } = await supabase
        .from('schedules')
        .insert([scheduleData]);

    if (error) {
        console.error('Error saving data:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } else {
        console.log('Data saved successfully:', data);
        alert('บันทึกข้อมูลสำเร็จ!');
        document.getElementById('schedule-form').reset(); // ล้างฟอร์ม
        loadSchedules(); // โหลดข้อมูลใหม่มาแสดง
    }
}

// --- ส่วนที่ 3: ฟังก์ชันสำหรับโหลดและแสดงข้อมูล ---
async function loadSchedules() {
    const tableBody = document.getElementById('schedule-table-body');
    tableBody.innerHTML = '<tr><td colspan="4">กำลังโหลด...</td></tr>'; // แสดงสถานะกำลังโหลด

    // ดึงข้อมูลทั้งหมดจากตาราง 'schedules' โดยเรียงตามวันที่ล่าสุดก่อน
    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error loading data:', error);
        tableBody.innerHTML = '<tr><td colspan="4">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    } else if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>';
    } else {
        tableBody.innerHTML = ''; // ล้างข้อมูลเก่า
        data.forEach(item => {
            const row = `<tr>
                <td>${item.employee_name} (${item.employee_id})</td>
                <td>${item.date}</td>
                <td>${item.status}</td>
                <td><button onclick="deleteSchedule(${item.id})">ลบ</button></td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }
}

// --- ส่วนที่ 4: ฟังก์ชันสำหรับลบข้อมูล ---
async function deleteSchedule(id) {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
        return;
    }

    const { data, error } = await supabase
        .from('schedules')
        .delete()
        .match({ id: id });

    if (error) {
        console.error('Error deleting data:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    } else {
        alert('ลบข้อมูลสำเร็จ!');
        loadSchedules(); // โหลดข้อมูลใหม่
    }
}


// --- ส่วนที่ 5: เริ่มต้นทำงานเมื่อหน้าเว็บโหลดเสร็จ ---
document.addEventListener('DOMContentLoaded', () => {
    // เชื่อมปุ่มบันทึกกับฟังก์ชัน
    const form = document.getElementById('schedule-form');
    if(form) {
        form.addEventListener('submit', saveSchedule);
    }
    // โหลดข้อมูลครั้งแรก
    loadSchedules();
});
