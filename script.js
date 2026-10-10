const STORAGE_KEY = 'task_now_events';

// 1. Safe Load Function (replaces standard JSON.parse)
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Corrupted localStorage data, resetting:", error);
    return [];
  }
}

// 2. Save Function
function saveTasks(tasksArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksArray));
}

// 3. Export to a JSON file
function exportTasks() {
  const tasks = localStorage.getItem(STORAGE_KEY);
  if (!tasks || tasks === '[]') {
    alert("No tasks available to export!");
    return;
  }

  const blob = new Blob([tasks], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = `task_now_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

// 4. Import from a chosen JSON file
function importTasks(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        saveTasks(importedData);
        alert("Tasks restored successfully!");
        // Re-render your UI or reload the page to show the new tasks
        location.reload();
      } else {
        alert("Invalid file format. Please upload a valid Task Now backup.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}