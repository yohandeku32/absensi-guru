// PERHATIAN: Pastikan URL ini adalah URL terbaru hasil Deploy di Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxqlhMHviBkUnn-HtpRBN5-1mfF2zzsR4RlSE-_9nHlcOdHXz2Rc57OEGKcH8igLjtgA/exec";
const MASTER_USERS = [
    {id:'admin',name:'Admin Sistem',role:'admin'},
    {id:'111321452',name:'Wilhelmina Kasih, S.Ag,S.Pd',role:'kepsek'},
    {id:'196706041991101001',name:'Ambrosius Sina, S.Pd',role:'guru'},
    {id:'196904212005012006',name:'Trifosa Rabe, S.Pd',role:'guru'},
    {id:'197301152000122002',name:'Priska Oni, S.Pd',role:'guru'},
    {id:'197007272000121007',name:'Flavianus V. Tumpung, S.Pd',role:'guru'},
    {id:'111321732',name:'Maria Junista Menge, S.Pd',role:'guru'},
    {id:'111321555',name:'Novi Mariana Loinati, S.Pd',role:'guru'},
    {id:'111321584',name:'Maria Yunita Lanus, S.Pd',role:'guru'},
    {id:'111321753',name:'Yohana Yusarli Nenobesi, S.Pd',role:'guru'},
    {id:'101',name:'Stefanus Leli, S.Pd',role:'guru'},
    {id:'102',name:'Yohanes Ignasius T. Deku (TU)',role:'pegawai'}
];

let currentUser = null, globalDatabase = [], currentMode = '';

window.onload = async function() {
    const savedUser = localStorage.getItem('absen_user_session');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        await initApp();
    } else { 
        hideGlobalLoader();
        showPage('page-login'); 
    }
    lucide.createIcons();
};

async function initApp() {
    showGlobalLoader("Sinkronisasi Database...");
    await fetchDatabase();
    if (currentUser.role === 'admin') { 
        showPage('page-admin'); 
        renderAdminDetail(); 
    } else { 
        showPage('page-guru'); 
        renderGuruDashboard(); 
    }
    hideGlobalLoader();
}

function showGlobalLoader(text = "Menyiapkan Data...") {
    const loader = document.getElementById('global-loader');
    document.getElementById('loader-text').textContent = text;
    loader.style.display = 'flex';
    loader.style.opacity = '1';
}

function hideGlobalLoader() {
    const loader = document.getElementById('global-loader');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 300);
}

async function fetchDatabase() {
    try { 
        const res = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now()); 
        globalDatabase = await res.json(); 
    } catch (e) { console.error(e); }
}

function renderGuruDashboard() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role-label').textContent = currentUser.role.toUpperCase();
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' });
    
    // Menggunakan waktu lokal HP
    const now = new Date();
    const today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
    
    const myLogs = globalDatabase.filter(a => String(a.id_user) === String(currentUser.id) && String(a.date) === today);
    
    const dataMasuk = myLogs.find(l => l.status === 'MASUK' || l.status === 'MASUK & PULANG');
    const dataPulang = myLogs.find(l => l.status === 'PULANG' || l.status === 'MASUK & PULANG');

    updateButtonVisual('masuk', dataMasuk);
    updateButtonVisual('pulang', dataPulang);
    
    const logContainer = document.getElementById('today-log');
    logContainer.innerHTML = myLogs.length ? myLogs.map(l => `
      <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
        <div class="w-10 h-10 rounded-xl ${l.status.includes('MASUK') ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} flex items-center justify-center font-black text-xs">${l.status[0]}</div>
        <div class="flex-1"><p class="font-bold text-slate-800 text-sm">Absen ${l.status}</p><p class="text-[10px] text-slate-400 font-black uppercase">${l.time} WITA</p></div>
        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
      </div>
    `).join('') : '<p class="text-center text-slate-400 italic text-sm py-4">Belum ada absen hari ini.</p>';
    lucide.createIcons();
}

function updateButtonVisual(type, data) {
    const btn = document.getElementById(`btn-absen-${type}`);
    const txt = document.getElementById(`txt-${type}`);
    const pill = document.getElementById(`status-${type}-pill`);
    const icon = document.getElementById(`icon-${type}`);

    if (data) {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'bg-slate-50', 'border-emerald-200');
        icon.innerHTML = '<i data-lucide="check-circle-2" class="text-emerald-500 w-6 h-6"></i>';
        
        if (type === 'masuk') {
            const jamMasuk = data.time.split(' - ')[0];
            txt.textContent = `Sudah Absen (${jamMasuk})`;
            pill.textContent = `MASUK: ${jamMasuk}`;
        } else {
            txt.textContent = `Sudah Absen (${data.time})`;
            const jamPulangSaja = data.time.includes(' - ') ? data.time.split(' - ')[1] : data.time;
            pill.textContent = `PULANG: ${jamPulangSaja}`;
        }
    }
}

function triggerUpload(mode) { currentMode = mode; document.getElementById('universal-upload').click(); }

async function processUpload(event) {
    const file = event.target.files[0]; if (!file) return;
    
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    
    progressContainer.style.display = 'block';
    setTimeout(() => progressBar.style.width = '10%', 50);

    const btn = document.getElementById(`btn-absen-${currentMode.toLowerCase()}`);
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div><h3 class="font-bold text-slate-900 text-lg">Mengirim...</h3><p class="text-xs text-slate-500 font-medium">Mohon tunggu sebentar</p></div><div class="loader-small"></div>`;

    const reader = new FileReader();
    reader.onload = async function(e) {
        progressBar.style.width = '40%'; 

        // Menggunakan waktu lokal HP
        const now = new Date();
        const localDate = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');

        const payload = { 
            id_user: String(currentUser.id), 
            name: currentUser.name, 
            date: localDate, 
            time: new Date().toLocaleTimeString('id-ID', { hour12:false, hour:'2-digit', minute:'2-digit' }), 
            status: currentMode, 
            photo: e.target.result 
        };
        
        progressBar.style.width = '70%'; 

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, { 
                method: 'POST', 
                body: JSON.stringify(payload) 
            });

            const result = await response.json();

            if (result.status === 'error') {
                alert("GAGAL: " + result.message);
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                return; 
            }

            progressBar.style.width = '100%'; 
            setTimeout(() => {
                document.getElementById('modal-success').classList.remove('hidden');
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 400); 

        } catch (err) {
            alert("Gagal mengirim data. Pastikan internet stabil.");
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }
    };
    reader.readAsDataURL(file);
}

async function handleResetData() {
    if (!confirm("⚠️ APAKAH ANDA YAKIN? Semua data absensi di Spreadsheet akan dihapus permanen!")) return;
    
    showGlobalLoader("Menghapus data...");
    try {
        await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'clear' }) });
        alert("Data berhasil direset!");
        location.reload();
    } catch (error) {
        alert("Gagal mereset data.");
        hideGlobalLoader();
    }
}

function closeModal() {
    document.getElementById('modal-success').classList.add('hidden');
    location.reload();
}

function renderAdminDetail() {
    const selGuruId = document.getElementById('admin-filter-guru').value;
    const selBulan = document.getElementById('admin-filter-bulan').value;
    const prefix = `${new Date().getFullYear()}-${selBulan}`;
    
    const selGuru = document.getElementById('admin-filter-guru');
    if (selGuru.options.length <= 1) {
        MASTER_USERS.filter(u => u.role !== 'admin').forEach(u => {
            const opt = document.createElement('option'); opt.value = u.id; opt.textContent = u.name; selGuru.appendChild(opt);
        });
    }

    let filtered = globalDatabase.filter(d => String(d.date).startsWith(prefix));
    if(selGuruId) filtered = filtered.filter(d => String(d.id_user) === String(selGuruId));

    document.getElementById('table-detail-body').innerHTML = filtered.map((r, i) => `
        <tr>
            <td class="p-4 text-center border-r">${i+1}</td>
            <td class="p-4 font-bold border-r">${r.name}</td>
            <td class="p-4 text-center border-r">${r.date}</td>
            <td class="p-4 text-center border-r font-bold text-emerald-600">${r.time.split(' - ')[0]}</td>
            <td class="p-4 text-center font-bold text-orange-600">${r.time.includes(' - ') ? r.time.split(' - ')[1] : (r.status === 'PULANG' ? r.time : '-')}</td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function handleLogin() {
    const id = document.getElementById('login-id').value.trim();
    const role = document.getElementById('login-role').value;
    const user = MASTER_USERS.find(u => String(u.id) === id && u.role === role);
    
    if (user) { 
        const btn = document.getElementById('btn-login');
        btn.disabled = true;
        btn.innerHTML = `<span class="loader-small mr-2"></span> Memproses...`;
        
        localStorage.setItem('absen_user_session', JSON.stringify(user)); 
        currentUser = user;
        await initApp();
    } else { 
        alert("NIP/Username atau Peran salah!"); 
    }
}

function logout() { localStorage.removeItem('absen_user_session'); location.reload(); }
function showPage(id) { document.querySelectorAll('#app > div').forEach(d => d.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); lucide.createIcons(); }
