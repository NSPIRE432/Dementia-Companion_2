/* DEMENTIA COMPANION VANILLA JAVASCRIPT APPLICATION */

const STORAGE_KEY = "dementia_companion_" + window.USER_EMAIL;

let currentPage = "home";
let currentStep = 1;
let currentGame = null;
let gameState = null;
let speechRecognition = null;


/* DEFAULT DATA */

const defaultData = () => ({
  onboarded: false,

  profile: {
    name: "",
    city: "",
    state: "",
    country: ""
  },

  permissions: {
    personal: false,
    photos: false,
    voice: false,
    location: false,
    caregiver: false
  },

  accessibility: {
    textSize: "normal",
    highContrast: false,
    reduceMotion: false,
    language: "en",
    theme: "light",
    readAloud: false
  },

  schedule: [
    {
      id: uid(),
      time: "08:00",
      title: "Breakfast",
      type: "Meal",
      note: "Start the morning gently."
    },
    {
      id: uid(),
      time: "10:00",
      title: "Morning Reminder",
      type: "Reminder",
      note: "Check today's plan."
    },
    {
      id: uid(),
      time: "12:30",
      title: "Lunch",
      type: "Meal",
      note: "Remember to drink some water."
    },
    {
      id: uid(),
      time: "16:00",
      title: "Walk",
      type: "Activity",
      note: "A short walk if comfortable."
    },
    {
      id: uid(),
      time: "19:30",
      title: "Dinner",
      type: "Meal",
      note: "Enjoy your evening."
    }
  ],

  reminders: [
    {
      id: uid(),
      time: "10:00",
      title: "Morning activity",
      category: "Activity",
      done: false
    },
    {
      id: uid(),
      time: "12:30",
      title: "Drink water",
      category: "Hydration",
      done: false
    },
    {
      id: uid(),
      time: "19:30",
      title: "Dinner",
      category: "Meal",
      done: false
    }
  ],

  people: [
    {
      id: uid(),
      name: "Rahul Mehta",
      relationship: "Son",
      phone: "Contact available",
      avatar: "RM"
    },
    {
      id: uid(),
      name: "Meera Mehta",
      relationship: "Daughter",
      phone: "Contact available",
      avatar: "MM"
    },
    {
      id: uid(),
      name: "Dr. Sharma",
      relationship: "Doctor",
      phone: "Contact available",
      avatar: "DS"
    }
  ],

  memories: [
    {
      id: uid(),
      title: "Family Picnic",
      person: "Rahul & Meera",
      description: "A happy afternoon together.",
      place: "Pune",
      date: "2026-09-15",
      visibility: "Only me",
      emoji: "🌳",
      photo: ""
    },
    {
      id: uid(),
      title: "Birthday Celebration",
      person: "Family",
      description: "A special family celebration.",
      place: "Home",
      date: "2026-08-20",
      visibility: "Caregivers",
      emoji: "🎂",
      photo: ""
    }
  ],

  gameSettings: {
    difficulty: "easy",
    questions: 3
  },

  audit: [
    {
      time: new Date().toISOString(),
      event: "Application initialized",
      detail: "Local application state created."
    }
  ]
});


let data = loadData();


/* STORAGE */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}


function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultData();
    }

    return {
      ...defaultData(),
      ...JSON.parse(saved)
    };

  } catch (error) {

    console.error(error);

    return defaultData();
  }
}


function saveData() {

  try {

    const copy = JSON.parse(JSON.stringify(data));

    if (!copy.permissions.personal) {
      copy.profile.name = "";
      copy.profile.city = "";
      copy.profile.state = "";
      copy.profile.country = "";
    }

    if (!copy.permissions.photos) {

      copy.memories = copy.memories.map(memory => ({
        ...memory,
        photo: ""
      }));

      copy.people = copy.people.map(person => ({
        ...person,
        photo: ""
      }));

    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));

  } catch (error) {

    console.error("Storage error:", error);

  }

}

/* APP START */

document.addEventListener("DOMContentLoaded", () => {

  if (data.onboarded ) {

    showApp();

  } else {

    showOnboarding();

  }

  setupNavigation();

});


function showOnboarding() {

  document.getElementById("onboarding").classList.remove("hidden");

  document.getElementById("app").classList.add("hidden");

  showStep(1);

}


function showApp() {

  document.getElementById("onboarding").classList.add("hidden");

  document.getElementById("app").classList.remove("hidden");

  applyAccessibility();

  render();

}


/* ONBOARDING */

function nextStep(step) {

  currentStep = step;

  showStep(step);

}


function showStep(step) {

  document
    .querySelectorAll(".onboarding-step")
    .forEach(el => el.classList.remove("active"));

  const target = document.getElementById("step" + step);

  if (target) {
    target.classList.add("active");
  }

  document
    .querySelectorAll(".progress-dot")
    .forEach((dot, index) => {

      dot.classList.toggle(
        "active",
        index < step
      );

    });

}


function validateName() {

  const name = document
    .getElementById("userName")
    .value
    .trim();

  if (!name) {

    showToast("Please enter your name.");

    document.getElementById("userName").focus();

    return;

  }

  nextStep(3);
}


function finishOnboarding() {

  const name = document
    .getElementById("userName")
    .value
    .trim();

  if (!name) {

    showToast("Please enter your name first.");

    nextStep(2);

    return;
  }


  data.profile.name = name;

  data.profile.city =
    document.getElementById("userCity").value.trim();

  data.profile.state =
    document.getElementById("userState").value.trim();

  data.profile.country =
    document.getElementById("userCountry").value.trim();


  data.permissions.personal =
    document.getElementById("consentPersonal").checked;

  data.permissions.photos =
    document.getElementById("consentPhotos").checked;

  data.permissions.voice =
    document.getElementById("consentVoice").checked;

  data.permissions.location =
    document.getElementById("consentLocation").checked ||
    document.getElementById("locationConsent").checked;


  data.accessibility.textSize =
    document.getElementById("onboardTextSize").value;

  data.accessibility.highContrast =
    document.getElementById("onboardContrast").checked;

  data.accessibility.reduceMotion =
    document.getElementById("onboardMotion").checked;

  data.accessibility.language =
    document.getElementById("onboardLanguage").value;


  data.onboarded = true;

  addAudit(
    "Onboarding completed",
    "Initial preferences were selected."
  );

  saveData();

  showApp();

  showToast(
    `You're all set, ${escapeHtml(name)}!`
  );
}


/* NAVIGATION */

function setupNavigation() {

  document
    .getElementById("navigation")
    .addEventListener("click", event => {

      const button =
        event.target.closest("[data-page]");

      if (!button) return;

      currentPage = button.dataset.page;

      document
        .querySelectorAll(".nav-item")
        .forEach(item => {

          item.classList.toggle(
            "active",
            item === button
          );

        });

      closeSidebar();

      render();

    });

}


function render() {

  applyAccessibility();

  updateDate();

  const pageContent =
    document.getElementById("pageContent");

  const title =
    document.getElementById("pageTitle");


  const pages = {
    home: "Home",
    schedule: "My Schedule",
    reminders: "Reminders",
    people: "People I Know",
    memories: "My Memories",
    games: "Games",
    voice: "Voice Assistant",
    help: "Help",
    caregiver: "Caregiver",
    privacy: "Privacy & Permissions",
    location: "Safety Location",
    audit: "Activity Log",
    settings: "Settings",
    how: "How It Works"
  };


  title.textContent =
    pages[currentPage] || "Dementia Companion";


  switch (currentPage) {

    case "home":
      pageContent.innerHTML = homePage();
      break;

    case "schedule":
      pageContent.innerHTML = schedulePage();
      break;

    case "reminders":
      pageContent.innerHTML = remindersPage();
      break;

    case "people":
      pageContent.innerHTML = peoplePage();
      break;

    case "memories":
      pageContent.innerHTML = memoriesPage();
      break;

    case "games":
      pageContent.innerHTML = gamesPage();
      break;

    case "voice":
      pageContent.innerHTML = voicePage();
      break;

    case "help":
      pageContent.innerHTML = helpPage();
      break;

    case "caregiver":
      pageContent.innerHTML = caregiverPage();
      break;

    case "privacy":
      pageContent.innerHTML = privacyPage();
      break;

    case "location":
      pageContent.innerHTML = locationPage();
      break;

    case "audit":
      pageContent.innerHTML = auditPage();
      break;

    case "settings":
      pageContent.innerHTML = settingsPage();
      break;

    case "how":
      pageContent.innerHTML = howPage();
      break;

    default:
      pageContent.innerHTML = homePage();

  }

}


/* HOME */

function homePage() {

  const name = data.profile.name || "there";

  const location =
    data.profile.city
      ? `${data.profile.city}${data.profile.state ? ", " + data.profile.state : ""}`
      : "Location sharing is off";


  return `

    <div class="hero">

      <h1>
        ${getGreeting()}, ${escapeHtml(name)} 👋
      </h1>

      <p>
        Here is your simple plan for today.
      </p>

      <div class="date-card">
        📍 ${escapeHtml(location)}
      </div>

      <div class="date-card">
        📅 <span id="liveClock">${formatDateTime()}</span>
      </div>

    </div>


    <div class="section-heading">
      <h2>What would you like to do?</h2>
    </div>


    <div class="card-grid">

      ${actionCard(
        "📅",
        "My Schedule",
        "See what is happening today.",
        "schedule"
      )}

      ${actionCard(
        "👥",
        "People",
        "See people you know.",
        "people"
      )}

      ${actionCard(
        "⏰",
        "Reminders",
        "Check your reminders.",
        "reminders"
      )}

      ${actionCard(
        "🖼️",
        "My Memories",
        "Look at special memories.",
        "memories"
      )}

      ${actionCard(
        "🎮",
        "Games",
        "Play a simple activity.",
        "games"
      )}

      ${actionCard(
        "🆘",
        "Help",
        "Get help and important contacts.",
        "help"
      )}

    </div>


    <div class="section-heading">

      <h2>Today's Schedule</h2>

      <button
        class="small-btn primary"
        onclick="navigateTo('schedule')">
        View all
      </button>

    </div>


    <div class="card">

      ${schedulePreview()}

    </div>


    <div class="section-heading">
      <h2>Important</h2>
    </div>

    <div class="two-column">

      <div class="card">

        <h3>🔐 Privacy</h3>

        <p class="muted">
          You control which information can be used.
        </p>

        <button
          class="small-btn primary"
          onclick="navigateTo('privacy')">
          Review permissions
        </button>

      </div>

      <div class="card">

        <h3>♿ Accessibility</h3>

        <p class="muted">
          Change text size, contrast, language and more.
        </p>

        <button
          class="small-btn primary"
          onclick="navigateTo('settings')">
          Open settings
        </button>

      </div>

    </div>

  `;
}


function actionCard(icon, title, description, page) {

  return `
    <button
      class="action-card"
      onclick="navigateTo('${page}')">

      <div class="action-icon">${icon}</div>

      <h3>${title}</h3>

      <p>${description}</p>

    </button>
  `;
}


function schedulePreview() {

  return data.schedule
    .slice(0, 5)
    .map(item => `

      <div class="list-item">

        <div class="list-main">

          <div class="list-icon">
            ${scheduleIcon(item.type)}
          </div>

          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <div class="muted">
              ${escapeHtml(formatTime(item.time))}
            </div>
          </div>

        </div>

      </div>

    `)
    .join("");

}


/*  SCHEDULE */

function schedulePage() {

  const sorted = [...data.schedule]
    .sort((a,b) => a.time.localeCompare(b.time));


  return `

    <div class="section-heading">

      <div>
        <h2>My Schedule</h2>
        <p class="muted">
          A simple timeline for your day.
        </p>
      </div>

      <button
        class="primary-btn"
        onclick="openScheduleModal()">
        + Add Activity
      </button>

    </div>


    <div class="card">

      <div class="timeline">

        ${sorted.length
          ? sorted.map(scheduleItem).join("")
          : emptyState("📅", "No activities yet.")
        }

      </div>

    </div>

  `;
}


function scheduleItem(item) {

  return `

    <div class="timeline-item">

      <div class="timeline-time">
        ${escapeHtml(formatTime(item.time))}
      </div>

      <div class="timeline-dot"></div>

      <div class="timeline-content">

        <strong>
          ${scheduleIcon(item.type)}
          ${escapeHtml(item.title)}
        </strong>

        <small>
          ${escapeHtml(item.type)}
        </small>

        <small>
          ${escapeHtml(item.note || "")}
        </small>

        <div class="list-actions" style="margin-top:8px">

          <button
            class="small-btn"
            onclick="openScheduleModal('${item.id}')">
            Edit
          </button>

          <button
            class="small-btn danger"
            onclick="deleteSchedule('${item.id}')">
            Delete
          </button>

        </div>

      </div>

    </div>

  `;
}


function openScheduleModal(id = null) {

  const item =
    data.schedule.find(x => x.id === id);


  openModal(

    id ? "Edit Activity" : "Add Activity",

    `

      <form id="scheduleForm">

        <input type="hidden" id="scheduleId" value="${id || ""}">

        <label>Time</label>
        <input
          id="scheduleTime"
          type="time"
          required
          value="${item ? item.time : "08:00"}">

        <label>Activity</label>
        <input
          id="scheduleTitle"
          required
          placeholder="Example: Breakfast"
          value="${item ? escapeAttr(item.title) : ""}">

        <label>Type</label>

        <select id="scheduleType">

          <option ${item?.type === "Meal" ? "selected" : ""}>
            Meal
          </option>

          <option ${item?.type === "Appointment" ? "selected" : ""}>
            Appointment
          </option>

          <option ${item?.type === "Activity" ? "selected" : ""}>
            Activity
          </option>

          <option ${item?.type === "Reminder" ? "selected" : ""}>
            Reminder
          </option>

        </select>

        <label>Note</label>

        <textarea
          id="scheduleNote"
          placeholder="Optional note">${item ? escapeHtml(item.note || "") : ""}</textarea>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button
            type="submit"
            class="primary-btn">
            Save
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("scheduleForm")
    .onsubmit = event => {

      event.preventDefault();

      const scheduleId =
        document.getElementById("scheduleId").value;

      const newItem = {

        id: scheduleId || uid(),

        time:
          document.getElementById("scheduleTime").value,

        title:
          document.getElementById("scheduleTitle").value.trim(),

        type:
          document.getElementById("scheduleType").value,

        note:
          document.getElementById("scheduleNote").value.trim()

      };


      if (scheduleId) {

        const index =
          data.schedule.findIndex(x => x.id === scheduleId);

        data.schedule[index] = newItem;

        addAudit(
          "Schedule updated",
          newItem.title
        );

      } else {

        data.schedule.push(newItem);

        addAudit(
          "Schedule item added",
          newItem.title
        );

      }


      saveData();

      closeModal();

      render();

      showToast("Schedule saved.");

    };

}


function deleteSchedule(id) {

  if (!confirm("Delete this schedule item?")) return;

  data.schedule =
    data.schedule.filter(x => x.id !== id);

  addAudit(
    "Schedule item deleted",
    id
  );

  saveData();

  render();

  showToast("Schedule item deleted.");

}


/* REMINDERS */

function remindersPage() {

  return `

    <div class="section-heading">

      <div>
        <h2>Smart Reminders</h2>
        <p class="muted">
          Keep track of meals, activities and important tasks.
        </p>
      </div>

      <button
        class="primary-btn"
        onclick="openReminderModal()">
        + Add Reminder
      </button>

    </div>


    <div class="list">

      ${
        data.reminders.length
        ? data.reminders.map(reminderItem).join("")
        : emptyState("⏰", "No reminders yet.")
      }

    </div>

  `;
}


function reminderItem(item) {

  return `

    <div class="list-item">

      <div class="list-main">

        <div class="list-icon">
          ⏰
        </div>

        <div>

          <strong>
            ${escapeHtml(item.title)}
          </strong>

          <div class="muted">
            ${escapeHtml(formatTime(item.time))}
            ·
            ${escapeHtml(item.category)}
          </div>

          ${
            item.done
              ? `<span class="status on">Done</span>`
              : `<span class="status off">Pending</span>`
          }

        </div>

      </div>


      <div class="list-actions">

        ${
          !item.done
          ? `
            <button
              class="small-btn primary"
              onclick="completeReminder('${item.id}')">
              ✓ Done
            </button>

            <button
              class="small-btn"
              onclick="snoozeReminder('${item.id}')">
              Remind me later
            </button>
          `
          : ""
        }

        <button
          class="small-btn"
          onclick="openReminderModal('${item.id}')">
          Edit
        </button>

        <button
          class="small-btn danger"
          onclick="deleteReminder('${item.id}')">
          Delete
        </button>

      </div>

    </div>

  `;
}


function openReminderModal(id = null) {

  const item =
    data.reminders.find(x => x.id === id);


  openModal(

    id ? "Edit Reminder" : "Add Reminder",

    `

      <form id="reminderForm">

        <input
          type="hidden"
          id="reminderId"
          value="${id || ""}">

        <label>Time</label>

        <input
          id="reminderTime"
          type="time"
          required
          value="${item ? item.time : "09:00"}">

        <label>Reminder</label>

        <input
          id="reminderTitle"
          required
          placeholder="Example: Drink water"
          value="${item ? escapeAttr(item.title) : ""}">

        <label>Category</label>

        <select id="reminderCategory">

          ${["Appointment","Meal","Hydration","Medicine","Activity","Task"]
            .map(x =>
              `<option ${item?.category === x ? "selected" : ""}>${x}</option>`
            )
            .join("")}

        </select>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button
            class="primary-btn">
            Save
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById("reminderForm")
    .onsubmit = event => {

      event.preventDefault();

      const reminderId =
        document.getElementById("reminderId").value;


      const newReminder = {

        id: reminderId || uid(),

        time:
          document.getElementById("reminderTime").value,

        title:
          document.getElementById("reminderTitle").value.trim(),

        category:
          document.getElementById("reminderCategory").value,

        done: item ? item.done : false

      };


      if (reminderId) {

        const index =
          data.reminders.findIndex(x => x.id === reminderId);

        data.reminders[index] = newReminder;

      } else {

        data.reminders.push(newReminder);

      }


      addAudit(
        "Reminder saved",
        newReminder.title
      );

      saveData();

      closeModal();

      render();

      showToast("Reminder saved.");

    };

}


function completeReminder(id) {

  const item =
    data.reminders.find(x => x.id === id);

  if (!item) return;

  item.done = true;

  addAudit(
    "Reminder completed",
    item.title
  );

  saveData();

  render();

  showToast("Great! Reminder marked as done.");

}


function snoozeReminder(id) {

  const item =
    data.reminders.find(x => x.id === id);

  if (!item) return;

  showToast(
    `${item.title} will be remembered later.`
  );

  addAudit(
    "Reminder snoozed",
    item.title
  );

}


function deleteReminder(id) {

  if (!confirm("Delete this reminder?")) return;

  data.reminders =
    data.reminders.filter(x => x.id !== id);

  saveData();

  render();

  showToast("Reminder deleted.");

}


/* PEOPLE */

function peoplePage() {

  return `

    <div class="section-heading">

      <div>
        <h2>People I Know</h2>

        <p class="muted">
          Keep important people easy to recognize.
        </p>

      </div>

      <button
        class="primary-btn"
        onclick="openPersonModal()">
        + Add Person
      </button>

    </div>


    <div class="people-grid">

      ${
        data.people.length
        ? data.people.map(personCard).join("")
        : emptyState("👥", "No people added yet.")
      }

    </div>

  `;
}

function personCard(person) {

  return `

    <div class="person-card">

      <div class="person-top">

        <div class="avatar">
          ${person.photo
            ? `<img src="${person.photo}" alt="">`
            : escapeHtml(person.avatar)}
        </div>

        <div>
          <h3>${escapeHtml(person.name)}</h3>
          <div class="muted">${escapeHtml(person.relationship)}</div>
        </div>

      </div>

      <div class="person-actions">

        <p class="muted">
          📞 ${escapeHtml(person.phone || "No contact information")}
        </p>

        <div class="list-actions">

          <button class="small-btn primary" onclick="simulateCall('${person.id}')">
            📞 Call
          </button>

          <button class="small-btn" onclick="simulateVideo('${person.id}')">
            📹 Video
          </button>

          <button class="small-btn" onclick="openPersonModal('${person.id}')">
            Edit
          </button>

          <button class="small-btn danger" onclick="deletePerson('${person.id}')">
            Delete
          </button>

        </div>

      </div>

    </div>

  `;
}
          


function openPersonModal(id = null) {

  const item = data.people.find(x => x.id === id);

  openModal(

    id ? "Edit Person" : "Add Person",

    `
      <form id="personForm">

        <input type="hidden" id="personId" value="${id || ""}">

        <label>Name</label>
        <input id="personName" required value="${item ? escapeAttr(item.name) : ""}">

        <label>Relationship</label>
        <input
          id="personRelationship"
          placeholder="Example: Son"
          value="${item ? escapeAttr(item.relationship) : ""}">

        <label>Contact information</label>
        <input
          id="personPhone"
          placeholder="Phone or contact note"
          value="${item ? escapeAttr(item.phone) : ""}">

        <label>Initials</label>
        <input
          id="personAvatar"
          maxlength="3"
          placeholder="RM"
          value="${item ? escapeAttr(item.avatar) : ""}">

        <label>
          Photo ${data.permissions.photos ? "(optional)" : "(turn on Photos in Privacy first)"}
        </label>
        <input
          id="personPhoto"
          type="file"
          accept="image/*"
          ${data.permissions.photos ? "" : "disabled"}>

        <div class="button-row">
          <button type="button" class="secondary-btn" onclick="closeModal()">
            Cancel
          </button>
          <button class="primary-btn">Save</button>
        </div>

      </form>
    `
  );

  document
    .getElementById("personForm")
    .onsubmit = async event => {

      event.preventDefault();

      const personId = document.getElementById("personId").value;

      const file = document.getElementById("personPhoto").files[0];

      let photo = item ? (item.photo || "") : "";

      if (file && data.permissions.photos) {
        photo = await readPhoto(file);
      }

      const person = {

        id: personId || uid(),

        name: document.getElementById("personName").value.trim(),

        relationship: document.getElementById("personRelationship").value.trim(),

        phone: document.getElementById("personPhone").value.trim(),

        avatar: document.getElementById("personAvatar").value.trim() || "👤",

        photo

      };

      if (personId) {

        const index = data.people.findIndex(x => x.id === personId);
        data.people[index] = person;

      } else {

        data.people.push(person);

      }

      addAudit("Person saved", person.name);

      saveData();
      closeModal();
      render();

      showToast("Person saved.");

    };

}


function deletePerson(id) {

  if (!confirm("Remove this person?")) return;

  data.people =
    data.people.filter(x => x.id !== id);

  saveData();

  render();

  showToast("Person removed.");

}


function simulateCall(id) {

  const person =
    data.people.find(x => x.id === id);

  if (!person) return;

  openModal(

    "Calling",

    `

      <div style="text-align:center;padding:25px">

        <div style="font-size:60px">📞</div>

        <h2>
          Calling ${escapeHtml(person.name)}
        </h2>

        <p class="muted">
          This button connects to the contact flow.
          A real phone connection requires device/backend integration.
        </p>

        <button
          class="primary-btn"
          onclick="closeModal()">
          End Call
        </button>

      </div>

    `
  );

}


function simulateVideo(id) {

  const person =
    data.people.find(x => x.id === id);

  if (!person) return;

  showToast(
    `Video call with ${person.name} can be connected to a video service later.`
  );

}


/* MEMORIES */

function memoriesPage() {

  return `

    <div class="section-heading">

      <div>

        <h2>My Memories</h2>

        <p class="muted">
          A simple memory wall for special moments.
        </p>

      </div>

      <button
        class="primary-btn"
        onclick="openMemoryModal()">
        + Add Memory
      </button>

    </div>


    <div class="memory-grid">

      ${
        data.memories.length
        ? data.memories.map(memoryCard).join("")
        : emptyState("🖼️", "No memories yet.")
      }

    </div>

  `;
}


function memoryCard(memory) {

  const image =
    memory.photo
      ? `<img src="${memory.photo}" alt="${escapeAttr(memory.title)}">`
      : memory.emoji;


  return `

    <article class="memory-card">

      <div class="memory-image">
        ${image}
      </div>

      <div class="memory-info">

        <h3>
          ${escapeHtml(memory.title)}
        </h3>

        <p>
          ${escapeHtml(memory.description)}
        </p>

        <p>
          👤 ${escapeHtml(memory.person)}
        </p>

        <p>
          📍 ${escapeHtml(memory.place)}
        </p>

        <p>
          📅 ${escapeHtml(memory.date)}
        </p>

        <span class="status on">
          ${escapeHtml(memory.visibility)}
        </span>

        <div class="list-actions" style="margin-top:15px">

          <button
            class="small-btn"
            onclick="openMemoryModal('${memory.id}')">
            Edit
          </button>

          <button
            class="small-btn danger"
            onclick="deleteMemory('${memory.id}')">
            Delete
          </button>

        </div>

      </div>

    </article>

  `;
}


function openMemoryModal(id = null) {

  const item =
    data.memories.find(x => x.id === id);


  if (!data.permissions.photos) {

    showToast(
      "Photo permission is OFF. You can still create a text/emoji memory."
    );

  }


  openModal(

    id ? "Edit Memory" : "Add Memory",

    `

      <form id="memoryForm">

        <input
          type="hidden"
          id="memoryId"
          value="${id || ""}">

        <label>Title</label>

        <input
          id="memoryTitle"
          required
          placeholder="Example: Family Picnic"
          value="${item ? escapeAttr(item.title) : ""}">

        <label>People</label>

        <input
          id="memoryPerson"
          placeholder="Example: Family"
          value="${item ? escapeAttr(item.person) : ""}">

        <label>Description</label>

        <textarea
          id="memoryDescription"
          placeholder="What do you remember?">${item ? escapeHtml(item.description) : ""}</textarea>

        <label>Place</label>

        <input
          id="memoryPlace"
          value="${item ? escapeAttr(item.place) : ""}">

        <label>Date</label>

        <input
          id="memoryDate"
          type="date"
          value="${item ? escapeAttr(item.date) : ""}">

        <label>Visibility</label>

        <select id="memoryVisibility">

          <option ${item?.visibility === "Only me" ? "selected" : ""}>
            Only me
          </option>

          <option ${item?.visibility === "Caregivers" ? "selected" : ""}>
            Caregivers
          </option>

        </select>

        <label>Emoji</label>

        <input
          id="memoryEmoji"
          maxlength="2"
          value="${item ? escapeAttr(item.emoji) : "🌳"}">

        <label>
          Photo ${
            data.permissions.photos
              ? ""
              : "(photo permission is OFF)"
          }
        </label>

        <input
          id="memoryPhoto"
          type="file"
          accept="image/*"
          ${data.permissions.photos ? "" : "disabled"}>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button class="primary-btn">
            Save Memory
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById("memoryForm")
    .onsubmit = async event => {

      event.preventDefault();


      const memoryId =
        document.getElementById("memoryId").value;


      const file =
        document.getElementById("memoryPhoto").files[0];


      let photo =
        item ? item.photo : "";


      if (file && data.permissions.photos) {

        photo = await readFile(file);

      }


      const memory = {

        id: memoryId || uid(),

        title:
          document.getElementById("memoryTitle").value.trim(),

        person:
          document.getElementById("memoryPerson").value.trim(),

        description:
          document.getElementById("memoryDescription").value.trim(),

        place:
          document.getElementById("memoryPlace").value.trim(),

        date:
          document.getElementById("memoryDate").value,

        visibility:
          document.getElementById("memoryVisibility").value,

        emoji:
          document.getElementById("memoryEmoji").value || "🌳",

        photo

      };


      if (memoryId) {

        const index =
          data.memories.findIndex(x => x.id === memoryId);

        data.memories[index] = memory;

      } else {

        data.memories.push(memory);

      }


      addAudit(
        "Memory saved",
        memory.title
      );

      saveData();

      closeModal();

      render();

      showToast("Memory saved.");

    };

}


function deleteMemory(id) {

  if (!confirm("Delete this memory?")) return;

  data.memories =
    data.memories.filter(x => x.id !== id);

  addAudit(
    "Memory deleted",
    id
  );

  saveData();

  render();

  showToast("Memory deleted.");

}


function readFile(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}

function readPhoto(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const s = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(
          img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size
        );
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


/* GAMES */

function gamesPage() {

  if (currentGame && gameState) {

    return activeGamePage();

  }


  return `

    <div class="section-heading">

      <div>

        <h2>Games & Activities</h2>

        <p class="muted">
          Simple activities with encouraging feedback.
        </p>

      </div>

      <button
        class="small-btn"
        onclick="openGameSettings()">
        ⚙ Game Settings
      </button>

    </div>


    <div class="game-menu">

      ${gameCard(
        "🃏",
        "Memory Match",
        "Find matching pairs.",
        "memory"
      )}

      ${gameCard(
        "🍎",
        "Find the Different One",
        "Find the object that is different.",
        "different"
      )}

      ${gameCard(
        "🔵",
        "Simple Sequence",
        "Choose what comes next.",
        "sequence"
      )}

      ${gameCard(
        "🍎",
        "Word / Picture Match",
        "Match a picture with its word.",
        "word"
      )}

      ${gameCard(
        "🧠",
        "Remember Pictures",
        "Look, remember and choose.",
        "remember"
      )}

      ${gameCard(
        "☀️",
        "Daily Activity Quiz",
        "Simple everyday questions.",
        "quiz"
      )}

    </div>


    <div class="card">

      <h3>Game Settings</h3>

      <p class="muted">
        Difficulty: <strong>${escapeHtml(data.gameSettings.difficulty)}</strong>
        · Questions: <strong>${data.gameSettings.questions}</strong>
      </p>

      <p class="muted">
        These activities are for engagement and are not medical tests.
      </p>

    </div>

  `;
}


function gameCard(icon, title, description, id) {

  return `

    <button
      class="game-select"
      onclick="startGame('${id}')">

      <div class="game-emoji">${icon}</div>

      <h3>${title}</h3>

      <p>${description}</p>

    </button>

  `;
}


function startGame(type) {

  currentGame = type;

  gameState = {

    question: 0,

    score: 0,

    total: data.gameSettings.questions,

    feedback: "",

    phase: "question",

    board: [],

    flipped: [],

    matched: []

  };


  if (type === "memory") {

    createMemoryBoard();

  } else {

    createQuestion();

  }


  render();

}


function activeGamePage() {

  if (!gameState) return gamesPage();


  if (
    gameState.question >= gameState.total &&
    currentGame !== "memory"
  ) {

    return gameCompletePage();

  }


  if (currentGame === "memory") {

    return memoryGamePage();

  }


  const q = gameState.current;


  if (!q) return gamesPage();


  return `

    <div class="section-heading">

      <div>

        <h2>${escapeHtml(gameTitle(currentGame))}</h2>

        <p class="muted">
          Question ${gameState.question + 1}
          of ${gameState.total}
        </p>

      </div>

      <button
        class="small-btn"
        onclick="exitGame()">
        ← Games
      </button>

    </div>


    <div class="game-area">

      ${
        gameState.phase === "showing"
        ? `

          <h2>Remember these pictures</h2>

          <div class="game-objects">

            ${q.pictures
              .map(p => `<div class="object-btn">${p}</div>`)
              .join("")}

          </div>

          <p class="muted">
            Look carefully...
          </p>

        `
        : `

          <h2>${escapeHtml(q.question)}</h2>

          ${
            q.picture
            ? `<div style="font-size:75px;margin:20px">${q.picture}</div>`
            : ""
          }

          <div class="answer-grid">

            ${q.options
              .map((option,index) => `

                <button
                  class="answer-btn"
                  onclick="answerGame(${index})">

                  ${escapeHtml(String(option))}

                </button>

              `)
              .join("")}

          </div>

          ${
            gameState.feedback
            ? `

              <div class="card">

                <h3>${escapeHtml(gameState.feedback)}</h3>

                <button
                  class="primary-btn"
                  onclick="nextGameQuestion()">
                  ${gameState.question + 1 >= gameState.total
                    ? "See Result"
                    : "Next →"}
                </button>

              </div>

            `
            : ""
          }

        `
      }

    </div>

  `;
}


function gameTitle(type) {

  const titles = {

    memory: "Memory Match",
    different: "Find the Different One",
    sequence: "Simple Sequence",
    word: "Word / Picture Match",
    remember: "Remember Pictures",
    quiz: "Daily Activity Quiz"

  };

  return titles[type] || "Game";

}


function createQuestion() {

  gameState.feedback = "";

  gameState.phase = "question";

  const type = currentGame;


  if (type === "different") {

    const sets = [

      {
        objects: ["🍎","🍎","🍎","🍌"],
        answer: 3
      },

      {
        objects: ["🐶","🐶","🐱","🐶"],
        answer: 2
      },

      {
        objects: ["⭐","⭐","🌙","⭐"],
        answer: 2
      },

      {
        objects: ["🚗","🚗","🚕","🚗"],
        answer: 2
      }

    ];


    const set =
      sets[Math.floor(Math.random() * sets.length)];


    gameState.current = {

      question: "Tap the different object.",

      options: set.objects,

      answer: set.answer

    };

  }


  if (type === "sequence") {

    const patterns = [

      {
        picture: "🔵 🟡 🔵 🟡 ?",
        options: ["🔵","🟡","🟢"],
        answer: 0
      },

      {
        picture: "⭐ 🌙 ⭐ 🌙 ?",
        options: ["☀️","⭐","🌙"],
        answer: 1
      },

      {
        picture: "🍎 🍌 🍎 🍌 ?",
        options: ["🍎","🍇","🍌"],
        answer: 0
      }

    ];


    const p =
      patterns[Math.floor(Math.random() * patterns.length)];


    gameState.current = {

      question: "What comes next?",

      picture: p.picture,

      options: p.options,

      answer: p.answer

    };

  }


  if (type === "word") {

    const questions = [

      {
        picture: "🍎",
        question: "Which word matches this picture?",
        options: ["Apple","Chair","House"],
        answer: 0
      },

      {
        picture: "🏠",
        question: "Which word matches this picture?",
        options: ["House","Apple","Car"],
        answer: 0
      },

      {
        picture: "🚗",
        question: "Which word matches this picture?",
        options: ["Chair","Car","Tree"],
        answer: 1
      }

    ];


    gameState.current =
      questions[Math.floor(Math.random() * questions.length)];

  }


  if (type === "quiz") {

    const questions = [

      {
        question: "What do we usually use to tell time?",
        options: ["Clock","Spoon","Shoe"],
        answer: 0
      },

      {
        question: "Which one is usually eaten for breakfast?",
        options: ["Breakfast food","Pillow","Shoes"],
        answer: 0
      },

      {
        question: "What do we use when it rains?",
        options: ["Umbrella","Spoon","Book"],
        answer: 0
      },

      {
        question: "Which one helps us make a phone call?",
        options: ["Phone","Plate","Chair"],
        answer: 0
      }

    ];


    gameState.current =
      questions[Math.floor(Math.random() * questions.length)];

  }

  if (type === "remember") {

    const sets = [
      ["🍎","🚗","🌳"],
      ["🐶","🎂","⭐"],
      ["🏠","🌸","☀️"],
      ["📚","☕","🚲"]
    ];

    const pictures = sets[Math.floor(Math.random() * sets.length)];

    // decoy = any emoji that is not in the shown set
    const decoyPool = sets.flat().filter(p => !pictures.includes(p));
    const decoy = decoyPool.length
      ? decoyPool[Math.floor(Math.random() * decoyPool.length)]
      : "🌹";

    const all = [...pictures, decoy].sort(() => Math.random() - 0.5);

    gameState.current = {
      question: "Which picture was NOT shown?",
      pictures,
      options: all,
      answer: all.indexOf(decoy)
    };

    // these two parts belong INSIDE the remember block
    gameState.phase = "showing";

    setTimeout(() => {
      if (currentGame === "remember" && gameState) {
        gameState.phase = "question";
        render();
      }
    }, 3000);

  }

}




function answerGame(index) {

  if (gameState.feedback) return;


  const correct =
    index === gameState.current.answer;


  if (correct) {

    gameState.score++;

    gameState.feedback =
      "🎉 Good job! That is correct.";

  } else {

    gameState.feedback =
      "🌿 That's okay. Let's try the next one.";

  }


  render();

}


function nextGameQuestion() {

  gameState.question++;

  if (gameState.question >= gameState.total) {

    render();

    return;

  }


  createQuestion();

  render();

}


function gameCompletePage() {

  return `

    <div class="game-area">

      <div style="font-size:60px">🌟</div>

      <h2>Well done!</h2>

      <p>
        You completed the activity.
      </p>

      <h3>
        ${gameState.score} out of ${gameState.total}
      </h3>

      <p class="muted">
        These activities are for enjoyment and engagement.
      </p>

      <button
        class="primary-btn"
        onclick="exitGame()">
        Back to Games
      </button>

    </div>

  `;

}


function createMemoryBoard() {

  const symbols =
    data.gameSettings.difficulty === "medium"
      ? ["🍎","🍌","🌳","⭐"]
      : ["🍎","🍌","🌳"];


  const cards =
    [...symbols, ...symbols]
      .map((symbol,index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false
      }))
      .sort(() => Math.random() - 0.5);


  gameState.board = cards;

}


function memoryGamePage() {

  const matched =
    gameState.board.filter(x => x.matched).length;


  if (matched === gameState.board.length) {

    return `

      <div class="game-area">

        <div style="font-size:60px">🎉</div>

        <h2>Great memory!</h2>

        <p>You found all the pairs.</p>

        <button
          class="primary-btn"
          onclick="exitGame()">
          Back to Games
        </button>

      </div>

    `;

  }


  return `

    <div class="section-heading">

      <div>

        <h2>Memory Match</h2>

        <p class="muted">
          Find the matching pairs.
        </p>

      </div>

      <button
        class="small-btn"
        onclick="exitGame()">
        ← Games
      </button>

    </div>


    <div class="game-area">

      <div class="answer-grid">

        ${gameState.board.map((card,index) => `

          <button
            class="answer-btn"
            style="font-size:40px"
            onclick="flipMemory(${index})">

            ${
              card.flipped || card.matched
              ? card.symbol
              : "❓"
            }

          </button>

        `).join("")}

      </div>

    </div>

  `;

}


function flipMemory(index) {

  const card =
    gameState.board[index];


  if (
    card.flipped ||
    card.matched ||
    gameState.flipped?.length >= 2
  ) {

    return;

  }


  card.flipped = true;


  if (!gameState.flipped) {

    gameState.flipped = [];

  }


  gameState.flipped.push(index);


  if (gameState.flipped.length === 2) {

    const [a,b] =
      gameState.flipped.map(i => gameState.board[i]);


    if (a.symbol === b.symbol) {

      a.matched = true;
      b.matched = true;

      gameState.flipped = [];

      render();

    } else {

      render();

      setTimeout(() => {

        a.flipped = false;
        b.flipped = false;

        gameState.flipped = [];

        render();

      }, 800);

    }

  } else {

    render();

  }

}


function exitGame() {

  currentGame = null;

  gameState = null;

  render();

}


function openGameSettings() {

  openModal(

    "Game Settings",

    `

      <form id="gameSettingsForm">

        <label>Difficulty</label>

        <select id="gameDifficulty">

          <option value="easy"
            ${data.gameSettings.difficulty === "easy" ? "selected" : ""}>
            Easy
          </option>

          <option value="medium"
            ${data.gameSettings.difficulty === "medium" ? "selected" : ""}>
            Medium
          </option>

        </select>

        <label>Number of questions</label>

        <select id="gameQuestions">

          ${[3,5,10].map(x => `
            <option value="${x}"
              ${data.gameSettings.questions === x ? "selected" : ""}>
              ${x}
            </option>
          `).join("")}

        </select>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button class="primary-btn">
            Save
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById("gameSettingsForm")
    .onsubmit = event => {

      event.preventDefault();

      data.gameSettings.difficulty =
        document.getElementById("gameDifficulty").value;

      data.gameSettings.questions =
        Number(
          document.getElementById("gameQuestions").value
        );

      saveData();

      closeModal();

      render();

      showToast("Game settings saved.");

    };

}


/* VOICE ASSISTANT */

function voicePage() {

  const supported =
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window;


  return `

    <div class="hero">

      <h1>🎤 Voice Assistant</h1>

      <p>
        Tap the microphone and speak one command.
        The app never continuously listens.
      </p>

    </div>


    <div class="two-column">

      <div class="card" style="text-align:center">

        <div style="font-size:75px">🎤</div>

        <h2>
          ${data.permissions.voice
            ? "Voice is available"
            : "Voice permission is OFF"}
        </h2>

        <button
          class="primary-btn"
          onclick="startVoice()"
          ${data.permissions.voice ? "" : "disabled"}>
          Tap to Speak
        </button>

        <p class="muted">
          ${
            supported
              ? "Your browser supports speech recognition."
              : "Speech recognition is not supported by this browser."
          }
        </p>

      </div>


      <div class="card">

        <h3>Try saying:</h3>

        <div class="list">

          ${voiceCommandButton("What do I have today?")}
          ${voiceCommandButton("When is lunch?")}
          ${voiceCommandButton("Who is Rahul?")}
          ${voiceCommandButton("What games can I play?")}

        </div>

      </div>

    </div>


    <div class="card" style="margin-top:20px">

      <h3>Assistant Response</h3>

      <div id="voiceResponse">
        Tap a command to hear a response.
      </div>

    </div>

  `;

}


function voiceCommandButton(command) {

  return `

    <button
      class="list-item"
      onclick="processVoiceCommand('${escapeAttr(command)}')">

      <span>💬 ${escapeHtml(command)}</span>

      <span>→</span>

    </button>

  `;

}


function startVoice() {

  if (!data.permissions.voice) {

    showToast("Please enable Voice permission in Privacy.");

    return;

  }


  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    showToast(
      "Speech recognition is not supported. Use one of the sample commands."
    );

    return;

  }


  speechRecognition =
    new Recognition();


  speechRecognition.lang =
    data.accessibility.language === "hi"
      ? "hi-IN"
      : data.accessibility.language === "mr"
        ? "mr-IN"
        : "en-IN";


  speechRecognition.continuous = false;

  speechRecognition.interimResults = false;


  speechRecognition.onstart = () => {

    showToast("Listening...");

  };


  speechRecognition.onresult = event => {

    const text =
      event.results[0][0].transcript;

    processVoiceCommand(text);

  };


  speechRecognition.onerror = () => {

    showToast("I couldn't hear that. Please try again.");

  };


  speechRecognition.start();

}


function processVoiceCommand(command) {

  command =
    command.toLowerCase();


  let response =
    "I can help you with your schedule, reminders, people or games.";


  if (
    command.includes("today") ||
    command.includes("schedule")
  ) {

    response =
      `You have ${data.schedule.length} activities in your schedule today.`;

  }


  else if (
    command.includes("lunch")
  ) {

    const lunch =
      data.schedule.find(x =>
        x.title.toLowerCase().includes("lunch")
      );

    response =
      lunch
        ? `Lunch is scheduled for ${formatTime(lunch.time)}.`
        : "I don't see lunch in your schedule.";

  }


  else if (
    command.includes("rahul")
  ) {

    const person =
      data.people.find(x =>
        x.name.toLowerCase().includes("rahul")
      );

    response =
      person
        ? `Rahul Mehta is listed as your ${person.relationship}.`
        : "I don't have Rahul in your people list.";

  }


  else if (
    command.includes("game") ||
    command.includes("games")
  ) {

    response =
      "You can play Memory Match, Find the Different One, Simple Sequence, Word Match, Remember Pictures and the Daily Activity Quiz.";

  }


  const box =
    document.getElementById("voiceResponse");


  if (box) {

    box.textContent = response;

  }


  speak(response);

}


/* HELP */

function helpPage() {

  return `

    <div class="hero">

      <h1>🆘 Help</h1>

      <p>
        Get help from people and services you trust.
      </p>

    </div>


    <div class="two-column">

      <div class="card">

        <h2>Need help?</h2>

        <p class="muted">
          Choose an option below.
        </p>

        <div class="list">

          <button
            class="list-item"
            onclick="helpAction('caregiver')">

            <span>🧑‍🍼 Call caregiver</span>
            <span>→</span>

          </button>

          <button
            class="list-item"
            onclick="helpAction('emergency')">

            <span>🚨 Emergency services</span>
            <span>→</span>

          </button>

          <button
            class="list-item"
            onclick="helpAction('contact')">

            <span>👥 Emergency contact</span>
            <span>→</span>

          </button>

        </div>

      </div>


      <div class="card">

        <h2>Important Information</h2>

        <p class="muted">
          Keep information here that a trusted caregiver
          may need in an emergency.
        </p>

        <div class="list">

          <div class="list-item">
            <strong>My name</strong>
            <span>${escapeHtml(data.profile.name)}</span>
          </div>

          <div class="list-item">
            <strong>City</strong>
            <span>${escapeHtml(data.profile.city || "Not provided")}</span>
          </div>

          <div class="list-item">
            <strong>Caregiver access</strong>
            <span>
              ${data.permissions.caregiver ? "ON" : "OFF"}
            </span>
          </div>

        </div>

      </div>

    </div>

  `;

}


function helpAction(type) {

  if (type === "emergency") {

    showToast(
      "Emergency services action selected. Connect this button to the appropriate local emergency service in a production deployment."
    );

    return;

  }


  if (type === "caregiver") {

    showToast(
      "Caregiver contact selected."
    );

    return;

  }


  showToast(
    "Emergency contact selected."
  );

}


/* CAREGIVER */

function caregiverPage() {

  const schedule =
    data.permissions.caregiver
      ? "ON"
      : "OFF";


  return `

    <div class="hero">

      <h1>🧑‍🍼 Caregiver Mode</h1>

      <p>
        Manage selected parts of the person's daily experience.
      </p>

      <span class="status demo">
        Frontend caregiver session
      </span>

    </div>


    <div class="three-column">

      ${statCard(
        "📅",
        data.schedule.length,
        "Schedule items"
      )}

      ${statCard(
        "⏰",
        data.reminders.length,
        "Reminders"
      )}

      ${statCard(
        "👥",
        data.people.length,
        "People"
      )}

      ${statCard(
        "🖼️",
        data.memories.length,
        "Memories"
      )}

      ${statCard(
        "📍",
        data.permissions.location ? "ON" : "OFF",
        "Location access"
      )}

      ${statCard(
        "🔐",
        data.permissions.caregiver ? "ON" : "OFF",
        "Caregiver access"
      )}

    </div>


    <div class="two-column" style="margin-top:20px">

      <div class="card">

        <h3>Access Permissions</h3>

        ${permissionStatus(
          "Schedule",
          true
        )}

        ${permissionStatus(
          "Reminders",
          true
        )}

        ${permissionStatus(
          "Memories",
          data.permissions.photos
        )}

        ${permissionStatus(
          "Location",
          data.permissions.location
        )}

      </div>


      <div class="card">

        <h3>Caregiver Role</h3>

        <select
          id="caregiverRole"
          onchange="saveCaregiverRole(this.value)">

          <option>Primary Caregiver</option>
          <option>Limited Caregiver</option>

        </select>

        <p class="muted">
          Primary caregivers can manage more features.
          Limited caregivers should only receive explicitly
          granted access in a production backend.
        </p>

        <button
          class="primary-btn"
          onclick="enableCaregiverAccess()">
          Enable Caregiver Access
        </button>

      </div>

    </div>


    <div class="card" style="margin-top:20px">

      <h3>Security Notice</h3>

      <p class="muted">
        This GitHub-hosted version stores application state
        in the browser. Production deployment should use
        secure authentication, server-side authorization,
        encrypted storage and proper session management.
      </p>

    </div>

  `;

}


function statCard(icon, value, title) {

  return `

    <div class="card">

      <div style="font-size:30px">${icon}</div>

      <h2 style="margin:5px 0">${value}</h2>

      <div class="muted">${title}</div>

    </div>

  `;

}


function permissionStatus(title, enabled) {

  return `

    <div class="setting-row">

      <div>

        <strong>${title}</strong>

      </div>

      <span class="status ${enabled ? "on" : "off"}">

        ${enabled ? "ON" : "OFF"}

      </span>

    </div>

  `;

}


function enableCaregiverAccess() {

  data.permissions.caregiver =
    !data.permissions.caregiver;

  addAudit(
    "Caregiver access changed",
    data.permissions.caregiver
      ? "Caregiver access enabled"
      : "Caregiver access disabled"
  );

  saveData();

  render();

  showToast(
    data.permissions.caregiver
      ? "Caregiver access enabled."
      : "Caregiver access disabled."
  );

}


function saveCaregiverRole(role) {

  localStorage.setItem(
    "caregiver_role",
    role
  );

}


/* PRIVACY */

function privacyPage() {

  return `

    <div class="hero">

      <h1>🔐 Privacy & Permissions</h1>

      <p>
        You decide which features can use your information.
      </p>

    </div>


    <div class="card">

      ${privacyToggle(
        "personal",
        "Personal information",
        "Name and basic profile information."
      )}

      ${privacyToggle(
        "photos",
        "Photos & memories",
        "Allows memory photos to be stored in this browser."
      )}

      ${privacyToggle(
        "voice",
        "Voice",
        "Allows one-time browser speech recognition."
      )}

      ${privacyToggle(
        "location",
        "Location",
        "Allows the simulated location view to be shared with authorized caregivers."
      )}

      ${privacyToggle(
        "caregiver",
        "Caregiver access",
        "Allows caregiver mode to be enabled."
      )}

    </div>


    <div class="two-column" style="margin-top:20px">

      <div class="card">

        <h3>What happens to your data?</h3>

        <p class="muted">
          This version stores selected information locally
          in your browser using localStorage.
        </p>

        <p class="muted">
          Voice recordings are not saved by this application.
        </p>

        <p class="muted">
          A production version should use a secure backend
          and encrypted storage.
        </p>

      </div>


      <div class="card">

        <h3>Data Controls</h3>

        <button
          class="danger-btn"
          onclick="deleteAllMemories()">
          Delete all memories
        </button>

        <br><br>

        <button
          class="secondary-btn"
          onclick="removeCaregiver()">
          Remove caregiver access
        </button>

      </div>

    </div>

  `;

}


function privacyToggle(key, title, description) {

  return `

    <div class="setting-row">

      <div>

        <strong>${title}</strong>

        <small>${description}</small>

      </div>

      <label style="margin:0">

        <input
          type="checkbox"
          ${data.permissions[key] ? "checked" : ""}
          onchange="changePermission('${key}', this.checked)">

      </label>

    </div>

  `;

}


function changePermission(key, value) {

  data.permissions[key] = value;

  addAudit(
    "Permission changed",
    `${key}: ${value ? "ON" : "OFF"}`
  );

  saveData();

  applyAccessibility();

  render();

  showToast(
    `${key} permission ${value ? "enabled" : "disabled"}.`
  );

}


function deleteAllMemories() {

  if (!confirm("Delete all memories?")) return;

  data.memories = [];

  addAudit(
    "All memories deleted",
    "Memory wall cleared."
  );

  saveData();

  render();

  showToast("All memories deleted.");

}


function removeCaregiver() {

  data.permissions.caregiver = false;

  addAudit(
    "Caregiver access revoked",
    "Caregiver access turned off."
  );

  saveData();

  render();

  showToast("Caregiver access removed.");

}


/* LOCATION */

function locationPage() {

  const enabled =
    data.permissions.location;


  return `

    <div class="hero">

      <h1>📍 Safety Location</h1>

      <p>
        Location sharing is controlled by you.
      </p>

    </div>


    <div class="card">

      ${
        enabled

        ? `

          <div style="font-size:60px">📍</div>

          <h2>Location sharing is ON</h2>

          <p>
            Last known location:
          </p>

          <h3>
            ${escapeHtml(
              data.profile.city || "Location not provided"
            )}
            ${
              data.profile.state
                ? ", " + escapeHtml(data.profile.state)
                : ""
            }
          </h3>

          <p class="muted">
            Updated ${new Date().toLocaleTimeString()}.
          </p>

          <span class="status demo">
            SIMULATED LOCATION DATA
          </span>

          <br><br>

          <button
            class="danger-btn"
            onclick="changePermission('location', false)">
            Turn Off Location Sharing
          </button>

        `

        : `

          <div style="font-size:60px">🔒</div>

          <h2>Location sharing is OFF</h2>

          <p class="muted">
            Your location is not available to caregiver mode.
          </p>

          <button
            class="primary-btn"
            onclick="changePermission('location', true)">
            Turn On Location Sharing
          </button>

        `
      }

    </div>

  `;

}


/* AUDIT */

function auditPage() {

  return `

    <div class="section-heading">

      <div>

        <h2>Activity Log</h2>

        <p class="muted">
          A record of important privacy and app actions.
        </p>

      </div>

    </div>


    <div class="list">

      ${
        data.audit
          .slice()
          .reverse()
          .map(item => `

            <div class="list-item">

              <div class="list-main">

                <div class="list-icon">
                  📋
                </div>

                <div>

                  <strong>
                    ${escapeHtml(item.event)}
                  </strong>

                  <div class="muted">
                    ${escapeHtml(item.detail)}
                  </div>

                  <small class="muted">
                    ${new Date(item.time).toLocaleString()}
                  </small>

                </div>

              </div>

            </div>

          `)
          .join("")

      }

    </div>

  `;

}


/* SETTINGS */

function settingsPage() {

  return `

    <div class="section-heading">

      <div>

        <h2>Settings</h2>

        <p class="muted">
          Personalize your experience.
        </p>

      </div>

    </div>


    <div class="card setting-group">

      <h3>Personal Information</h3>

      <label>Name</label>

      <input
        id="settingsName"
        value="${escapeAttr(data.profile.name)}">

      <label>City</label>

      <input
        id="settingsCity"
        value="${escapeAttr(data.profile.city)}">

      <label>State / Region</label>

      <input
        id="settingsState"
        value="${escapeAttr(data.profile.state)}">

      <label>Country</label>

      <input
        id="settingsCountry"
        value="${escapeAttr(data.profile.country)}">

      <button
        class="primary-btn"
        style="margin-top:15px"
        onclick="saveProfileSettings()">
        Save Personal Information
      </button>

    </div>


    <div class="card setting-group">

      <h3>Accessibility</h3>

      <label>Text Size</label>

      <select onchange="changeAccessibility('textSize', this.value)">

        <option value="normal"
          ${data.accessibility.textSize === "normal" ? "selected" : ""}>
          Normal
        </option>

        <option value="large"
          ${data.accessibility.textSize === "large" ? "selected" : ""}>
          Large
        </option>

        <option value="xlarge"
          ${data.accessibility.textSize === "xlarge" ? "selected" : ""}>
          Extra Large
        </option>

      </select>


      ${settingCheckbox(
        "highContrast",
        "High contrast",
        "Make important elements easier to distinguish."
      )}

      ${settingCheckbox(
        "reduceMotion",
        "Reduce animation",
        "Reduce movement and transitions."
      )}

      ${settingCheckbox(
        "readAloud",
        "Read aloud",
        "Use browser speech synthesis when available."
      )}

      <label>Language</label>

      <select onchange="changeAccessibility('language', this.value)">

        <option value="en"
          ${data.accessibility.language === "en" ? "selected" : ""}>
          English
        </option>

        <option value="hi"
          ${data.accessibility.language === "hi" ? "selected" : ""}>
          हिन्दी
        </option>

        <option value="mr"
          ${data.accessibility.language === "mr" ? "selected" : ""}>
          मराठी
        </option>

      </select>


      <label>Appearance</label>

      <select onchange="changeAccessibility('theme', this.value)">

        <option value="light"
          ${data.accessibility.theme === "light" ? "selected" : ""}>
          Light
        </option>

        <option value="dark"
          ${data.accessibility.theme === "dark" ? "selected" : ""}>
          Dark
        </option>

      </select>

    </div>


    <div class="card">

      <h3>Application Data</h3>

      <p class="muted">
        Resetting removes the information stored by this app
        in this browser and returns you to onboarding.
      </p>

      <button
        class="danger-btn"
        onclick="resetData()">
        Reset All App Data
      </button>

    </div>

  `;

}


function settingCheckbox(key, title, description) {

  return `

    <div class="setting-row">

      <div>

        <strong>${title}</strong>

        <small>${description}</small>

      </div>

      <input
        type="checkbox"
        ${data.accessibility[key] ? "checked" : ""}
        onchange="changeAccessibility('${key}', this.checked)">

    </div>

  `;

}


function saveProfileSettings() {

  const name =
    document.getElementById("settingsName").value.trim();


  if (!name) {

    showToast("Name cannot be empty.");

    return;

  }


  data.profile.name = name;

  data.profile.city =
    document.getElementById("settingsCity").value.trim();

  data.profile.state =
    document.getElementById("settingsState").value.trim();

  data.profile.country =
    document.getElementById("settingsCountry").value.trim();


  data.permissions.personal = true;

  addAudit(
    "Personal information updated",
    "Profile information changed."
  );

  saveData();

  render();

  showToast("Personal information saved.");

}


function changeAccessibility(key, value) {

  data.accessibility[key] = value;

  saveData();

  applyAccessibility();

  render();

}


/* HOW IT WORKS */

function howPage() {

  return `

    <div class="hero">

      <h1>ℹ️ How Dementia Companion Works</h1>

      <p>
        A simple digital companion designed around
        clarity, accessibility and user control.
      </p>

    </div>


    <div class="three-column">

      ${howCard(
        "1",
        "Set Up",
        "Enter your name and choose the settings you are comfortable with."
      )}

      ${howCard(
        "2",
        "Personalize",
        "Choose text size, language, contrast and privacy permissions."
      )}

      ${howCard(
        "3",
        "Navigate the Day",
        "Use the schedule and reminders to keep the day organized."
      )}

      ${howCard(
        "4",
        "Stay Connected",
        "Keep important people and memories easy to access."
      )}

      ${howCard(
        "5",
        "Enjoy Activities",
        "Play simple interactive memory and everyday activities."
      )}

      ${howCard(
        "6",
        "Stay in Control",
        "Review privacy settings and activity history whenever you want."
      )}

    </div>


    <div class="section-heading">
      <h2>Project Presentation</h2>
    </div>


    <div class="two-column">

      <div class="card">

        <h3>🎯 Target Users</h3>

        <p class="muted">
          People living with dementia and their trusted caregivers,
          with a strong focus on accessibility and simplicity.
        </p>

      </div>

      <div class="card">

        <h3>✨ Key Features</h3>

        <p class="muted">
          Schedule, reminders, memories, people, games,
          voice interaction, caregiver controls and privacy settings.
        </p>

      </div>

      <div class="card">

        <h3>🔐 Privacy Approach</h3>

        <p class="muted">
          Permissions are separated so users can decide
          what personal information, photos, voice and location
          features they want to allow.
        </p>

      </div>

      <div class="card">

        <h3>🚀 Future Improvements</h3>

        <p class="muted">
          Secure cloud backend, real authentication,
          caregiver notifications, secure video calling,
          encrypted storage and production-grade authorization.
        </p>

      </div>

    </div>

  `;

}


function howCard(number, title, text) {

  return `

    <div class="card">

      <div
        style="
          width:45px;
          height:45px;
          display:grid;
          place-items:center;
          border-radius:50%;
          background:var(--surface-2);
          color:var(--primary-dark);
          font-weight:800;
          font-size:20px;
        ">

        ${number}

      </div>

      <h3>${title}</h3>

      <p class="muted">${text}</p>

    </div>

  `;

}


/* GENERAL HELPERS */

function navigateTo(page) {

  currentPage = page;

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === page
      );

    });

  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function toggleSidebar() {

  document
    .getElementById("sidebar")
    .classList.toggle("open");

}


function closeSidebar() {

  document
    .getElementById("sidebar")
    .classList.remove("open");

}


function openModal(title, content) {

  document
    .getElementById("modalContent")
    .innerHTML = `

      <h2>${title}</h2>

      ${content}

    `;


  document
    .getElementById("modal")
    .classList.remove("hidden");

}


function closeModal() {

  document
    .getElementById("modal")
    .classList.add("hidden");

}


function showToast(message) {

  const toast =
    document.getElementById("toast");


  toast.textContent =
    message;


  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


function showStepAndFocus(step, elementId) {

  nextStep(step);

  setTimeout(() => {

    document
      .getElementById(elementId)
      ?.focus();

  }, 100);

}


function updateDate() {

  const date =
    document.getElementById("topDate");

  if (!date) return;

  date.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


function formatDateTime() {

  return new Date().toLocaleString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


setInterval(() => {

  const clock =
    document.getElementById("liveClock");

  if (clock) {

    clock.textContent =
      formatDateTime();

  }

}, 1000);


function getGreeting() {

  const hour =
    new Date().getHours();

  if (hour < 12) return "Good morning";

  if (hour < 17) return "Good afternoon";

  return "Good evening";

}


function formatTime(time) {

  if (!time) return "";

  const [hours, minutes] =
    time.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours),
    Number(minutes)
  );

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


function scheduleIcon(type) {

  const icons = {

    Meal: "🍽️",

    Appointment: "📅",

    Activity: "🚶",

    Reminder: "⏰"

  };

  return icons[type] || "📌";

}


function emptyState(icon, text) {

  return `

    <div class="empty">

      <div class="empty-icon">${icon}</div>

      <strong>${text}</strong>

    </div>

  `;

}


function addAudit(event, detail) {

  data.audit.push({
    time: new Date().toISOString(),
    event,
    detail
  });

  if (data.audit.length > 100) {
    data.audit = data.audit.slice(-100);
  }

}

function cleanForSpeech(text) {

  return String(text ?? "")
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D\u20E3]/gu, "")
    .replace(/[→←↑↓•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}




function speak(text) {

  if (!("speechSynthesis" in window)) {
    showToast("Text-to-speech is not supported.");
    return;
  }

  const cleaned = cleanForSpeech(text);

  if (!cleaned) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);

  utterance.lang =
    data.accessibility.language === "hi"
      ? "hi-IN"
      : data.accessibility.language === "mr"
        ? "mr-IN"
        : "en-IN";

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

}

function readCurrentPage() {

  speak(document.getElementById("pageContent").innerText);

}



function toggleTheme() {

  data.accessibility.theme =
    data.accessibility.theme === "dark"
      ? "light"
      : "dark";

  saveData();

  applyAccessibility();

}


function applyAccessibility() {

  const body =
    document.body;


  body.classList.remove(
    "text-large",
    "text-xlarge",
    "high-contrast",
    "reduce-motion",
    "theme-dark"
  );


  if (data.accessibility.textSize === "large") {

    body.classList.add("text-large");

  }


  if (data.accessibility.textSize === "xlarge") {

    body.classList.add("text-xlarge");

  }


  if (data.accessibility.highContrast) {

    body.classList.add("high-contrast");

  }


  if (data.accessibility.reduceMotion) {

    body.classList.add("reduce-motion");

  }


  if (data.accessibility.theme === "dark") {

    body.classList.add("theme-dark");

  }

}


function resetData() {

  if (
    !confirm(
      "Reset the entire app and return to onboarding?"
    )
  ) {

    return;

  }


  localStorage.removeItem(STORAGE_KEY);

  localStorage.removeItem("caregiver_role");

  data = defaultData();

  currentPage = "home";

  currentGame = null;

  gameState = null;

  showOnboarding();

  showToast("App has been reset.");

}


/* HTML ESCAPING */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttr(value) {

  return escapeHtml(value);

}


/* STARTUP SAFETY */

window.addEventListener("error", event => {

  console.error(
    "Application error:",
    event.error
  );

});


/* END */