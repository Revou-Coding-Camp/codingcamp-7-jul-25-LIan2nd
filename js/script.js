// Mengambil data tasks dari localStorage atau membuat array kosong jika tidak ada
let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
let filteredTasks = tasks; // Array untuk menyimpan tasks yang telah difilter
let currentFilter = "all"; // Filter yang sedang aktif

// Mengambil elemen-elemen DOM yang diperlukan
const form = document.getElementById("formTask");
const themeButton = document.getElementById("themeSwitcher");
const inputTask = document.getElementById('task');
const inputDate = document.getElementById('date');
const tasksList = document.getElementById('tasksData');
const deleteAllButton = document.getElementById('deleteAllButton');
const filterButton = document.getElementById('filterToggle');
const filterMenu = document.getElementById('filterMenu');
const filterAll = document.getElementById('filterAll');
const filterPending = document.getElementById('filterPending');
const filterCompleted = document.getElementById('filterCompleted');
const filterInfo = document.getElementById('filterInfo');
const alertBox = document.getElementById('alertBox');

// Menambahkan event listener untuk berbagai elemen
form.addEventListener('submit', addTask); // Event ketika form disubmit
themeButton.addEventListener('click', switchTheme); // Event untuk switch theme
deleteAllButton.addEventListener('click', deleteAllTask); // Event untuk hapus semua task
filterButton.addEventListener('click', showFilters); // Event untuk menampilkan menu filter
filterAll.addEventListener('click', () => filterTasks('all')); // Event filter semua task
filterPending.addEventListener('click', () => filterTasks('pending')); // Event filter task pending
filterCompleted.addEventListener('click', () => filterTasks('completed')); // Event filter task completed

/**
 * Fungsi untuk menampilkan atau menyembunyikan menu filter
 * Menggunakan toggle class 'hide' untuk show/hide menu
 */
function showFilters() {
  filterMenu.classList.toggle('hide');
}

/**
 * Fungsi untuk menampilkan alert
 * @param {string} message - Pesan alert yang ingin ditampilkan
 * @param {string} status - Status alert (success, danger, n warning)
 */
function showAlert(message, status) {
  // Hapus alert yang ada sebelumnya
  while (alertBox.firstChild) {
    alertBox.removeChild(alertBox.firstChild);
  }

  // Buat alert baru
  const alertMessage = `
    <div id="alert" class="bg-${status}">
      ${message}
      <button class="close-alert" onclick="this.parentElement.remove()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  // Tampilkan alert
  alertBox.classList.remove('hide');
  alertBox.insertAdjacentHTML('afterbegin', alertMessage);

  // Hilangkan alert setelah 5 detik
  setTimeout(() => {
    const alertMessage = alertBox.querySelector('#alert');
    if (alertMessage) {
      alertMessage.remove();
      // Sembunyikan container alert jika tidak ada alert lagi
      if (!alertBox.firstChild) {
        alertBox.classList.add('hide');
      }
    }
  }, 5000);
}

/**
 * Event listener untuk menutup menu filter ketika user klik di luar menu
 * Menggunakan event delegation untuk efisiensi
 */
document.querySelector('body').addEventListener('click', (event) => {
  // Jika klik bukan di dalam menu filter dan bukan tombol filter, tutup menu
  if (!filterMenu.contains(event.target) && !event.target.matches('#filterToggle')) {
    filterMenu.classList.add('hide');
  }
});

/**
 * Event listener untuk menangani klik pada tombol-tombol aksi di dalam tabel
 * Menggunakan event delegation untuk efisiensi dan menghindari multiple event listeners
 */
tasksList.addEventListener('click', function (e) {
  const button = e.target.closest('button');
  if (!button) return; // Jika bukan tombol, hentikan eksekusi

  const taskId = button.getAttribute('data-task-id'); // Ambil ID task dari atribut data

  // Tentukan aksi berdasarkan class tombol yang diklik
  if (button.classList.contains('btn-warning')) {
    editTask(taskId); // Tombol edit (kuning)
  } else if (button.classList.contains('btn-success')) {
    completedTask(taskId); // Tombol completed (hijau)
  } else if (button.classList.contains('btn-danger')) {
    deleteTask(taskId); // Tombol delete (merah)
  }
});

/**
 * Fungsi untuk memfilter tasks berdasarkan status
 * @param {string} filter - Jenis filter: 'all', 'pending', atau 'completed'
 */
function filterTasks(filter) {
  currentFilter = filter; // Simpan filter yang sedang aktif

  // Jika filter 'all', tampilkan semua tasks
  if (currentFilter === 'all') {
    filteredTasks = tasks;
    filterInfo.innerText = filter;
    getTasks(); // Render ulang daftar tasks
    filterMenu.classList.add('hide'); // Tutup menu filter
    return;
  }

  // Filter tasks berdasarkan status
  filteredTasks = tasks.filter((task) => {
    return task.status === currentFilter;
  });

  filterInfo.innerText = currentFilter; // Update teks info filter
  getTasks(); // Render ulang daftar tasks
  filterMenu.classList.add('hide'); // Tutup menu filter
}

/**
 * Fungsi untuk menghapus semua tasks
 * Menampilkan konfirmasi sebelum menghapus
 */
function deleteAllTask() {
  // Cek apakah ada tasks yang bisa dihapus
  if (!tasks.length > 0) {
    showAlert("Nothing task to delete", "success");
    return;
  }

  // Konfirmasi sebelum menghapus
  if (confirm("Are u sure you wanna delete all tasks?")) {
    tasks = []; // Kosongkan array tasks
    localStorage.setItem('tasks', tasks); // Update localStorage
    showAlert("All task deleted!", "success");
    filterTasks(currentFilter); // Render ulang dengan filter yang aktif
  }
  return;
}

/**
 * Fungsi untuk generate ID random untuk setiap task
 * Menggunakan Math.random dan toString(36) untuk membuat string acak
 * @returns {string} ID acak sepanjang 8 karakter
 */
function generateRandomId() {
  return Math.random().toString(36).substring(2, 2 + 8);
}

/**
 * Fungsi untuk mengedit task
 * Memiliki dua mode: edit mode dan save mode
 * @param {string} id - ID task yang akan diedit
 */
function editTask(id) {
  // Cari task yang akan diedit berdasarkan ID
  const taskToEdit = tasks.find(t => t.id === id);

  // Ambil elemen-elemen yang diperlukan
  const task = document.getElementById(`task-${id}`);
  const pencilIcon = document.getElementById(`edit-${id}`);
  const completedButton = document.getElementById(`completed-${id}`);
  const deleteButton = document.getElementById(`delete-${id}`);

  // Jika dalam mode save (icon berubah menjadi check)
  if (pencilIcon.classList.contains('bi-check-lg')) {
    // Ambil nilai baru dari input
    const newValue = task.querySelector('input').value.trim();

    // Validasi input tidak boleh kosong
    if (!newValue) {
      showAlert("Input what to do", "danger");
      return;
    }

    // Update task dengan nilai baru
    taskToEdit.task = newValue;
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Simpan ke localStorage

    // Tampilkan alert edit berhasil
    showAlert("Task edited!", "success");

    // Aktifkan kembali tombol completed dan delete
    completedButton.disabled = false;
    deleteButton.disabled = false;

    // Render ulang daftar tasks
    filterTasks(currentFilter);
    return;
  }

  // Mode edit - mulai mengedit
  pencilIcon.className = 'bi bi-check-lg'; // Ubah icon menjadi check
  task.innerHTML = `<input class="edit-input" type="text" value="${taskToEdit.task}" />`; // Ganti teks dengan input

  // Nonaktifkan tombol completed dan delete selama edit
  completedButton.disabled = true;
  deleteButton.disabled = true;

  // Fokus pada input dan pilih semua teks untuk UX yang lebih baik
  const input = task.querySelector('input');
  input.focus();
  input.select();
}

/**
 * Fungsi untuk menandai task sebagai completed
 * @param {string} id - ID task yang akan di-complete
 */
function completedTask(id) {
  // Cari task berdasarkan ID
  const taskToComplete = tasks.find(t => t.id === id);
  if (!taskToComplete) return; // Jika task tidak ditemukan, hentikan

  // Update status task menjadi completed
  taskToComplete.status = "completed";
  taskToComplete.completed = true;

  // Simpan perubahan ke localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Tampilkan alert completed berhasil
  showAlert("Task completed, Good Work!", "success");

  // Render ulang daftar tasks dengan filter yang aktif
  filterTasks(currentFilter);
}

/**
 * Fungsi untuk menghapus task
 * Menampilkan konfirmasi sebelum menghapus
 * @param {string} id - ID task yang akan dihapus
 */
function deleteTask(id) {
  // Cari index task berdasarkan ID
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return; // Jika task tidak ditemukan, hentikan

  // Konfirmasi sebelum menghapus
  if (confirm("Are u sure wanna delete this task?")) {
    tasks.splice(index, 1); // Hapus task dari array
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Update localStorage
    showAlert("Task deleted!", "success"); // Tampilkan alert hapus task
    filterTasks(currentFilter); // Render ulang daftar tasks
  }
}

/**
 * Fungsi untuk menampilkan daftar tasks di tabel
 * Menggunakan innerHTML untuk mengupdate konten tabel
 * Tasks ditampilkan dari yang terbaru ditambahkan (reverse order)
 */
function getTasks() {
  tasksList.innerHTML = ''; // Kosongkan konten tabel

  // Jika tidak ada tasks, tampilkan pesan
  if (filteredTasks.length === 0) {
    tasksList.innerHTML = '<tr><td>No task have been added yet</td></tr>';
    return;
  }

  // Buat salinan array dan balik urutannya agar yang terbaru tampil di atas
  const reversedTasks = [...filteredTasks].reverse();

  // Loop setiap task dan buat baris tabel
  reversedTasks.forEach((task) => {
    const taskRow = `
      <tr>
        <td id="task-${task.id}" class="${task.completed ? 'task-done' : ''}">${task.task}</td>
        <td class="${task.completed ? 'text-secondary' : ''}">${task.date}</td>
        <td class="${task.completed ? 'text-secondary' : ''}">${task.completed ? 'completed' : task.status}</td>
        <td>
          <button ${task.completed ? "disabled" : ""} class="btn-sm btn-warning mr-short" data-task-id="${task.id}">
            <i id="edit-${task.id}" class="bi bi-pencil"></i>
          </button>
          <button id="completed-${task.id}" ${task.completed ? "disabled" : ""} class="btn-sm btn-success mr-short" data-task-id="${task.id}">
            <i class="bi bi-check-lg"></i>
          </button>
          <button id="delete-${task.id}" class="btn-sm btn-danger mr-short" data-task-id="${task.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
    // Tambahkan baris ke tabel
    tasksList.insertAdjacentHTML('beforeend', taskRow);
  });
}

/**
 * Fungsi untuk menambahkan task baru
 * Dipanggil ketika form disubmit
 * @param {Event} e - Event object dari form submit
 */
function addTask(e) {
  const task = inputTask.value; // Ambil nilai input task
  const date = inputDate.value ? inputDate.value : "No due date"; // Ambil tanggal atau set default
  e.preventDefault(); // Prevent form submission default behavior

  // Validasi input task tidak boleh kosong
  if (!task) {
    showAlert("Input what to do!", "danger");
    return;
  }

  // Buat object task baru dengan timestamp untuk tracking urutan
  let todo = {
    id: generateRandomId(), // Generate ID unik
    task: task,
    date: date,
    status: "pending", // Status default
    completed: false, // Completed default false
    createdAt: new Date().getTime(), // Timestamp untuk tracking urutan
  };

  tasks.push(todo); // Tambahkan task ke array
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Simpan ke localStorage
  showAlert("Task created! Ganbatte neee", "success");
  form.reset(); // Reset form
  filterTasks('all'); // Tampilkan semua tasks (reset filter)
}

/**
 * Fungsi untuk switch theme (belum diimplementasi)
 * INII NANTII, YAAA ^_^
 */
function switchTheme() {
  showAlert("im so sorryyy, this isn't working yet:(", "warning");
}

// Inisialisasi: Tampilkan tasks saat halaman dimuat
getTasks();