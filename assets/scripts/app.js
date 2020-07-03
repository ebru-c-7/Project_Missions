const flags = {
  "very-important": "assets/img/flags/vimp.png",
  important: "assets/img/flags/imp.png",
  "nice-to-do": "assets/img/flags/ntd.png"
};

const TITLE = "title";
const FLAG = "flag";
const CATEGORY = "category";
let idCount = 1;
let isSealed = false;
const progressElement = document.querySelector("progress");

const activeTasksElement = document.getElementById("section-tasks-active");
const passiveTasksElement = document.getElementById("section-tasks-passive");
const messageBoxElements = document.querySelectorAll("ec-messagebox");

function message(text, type, img, fConfirm) {
  let msgBx = document.createElement("ec-messagebox");
  msgBx.setAttribute("type", type);
  msgBx.setAttribute("img", img);
  msgBx.setAttribute("active", "true");

  let newMessage = document.createElement("p");
  newMessage.textContent = text;
  msgBx.appendChild(newMessage);
  document.body.appendChild(msgBx);
  window.scrollTo(0, 0);

  const box = document.querySelector("ec-messagebox");
  box.addEventListener("cancel", () => {
    box.remove();
  });
  box.addEventListener("confirm", () => {
    box.remove();
    fConfirm();
  });
  // return box;
}

let tempformElement;
class Form {
  constructor(element) {
    this.form = element;
    this.sealButton = this.form.querySelector("#section-form__seal");
    this.sealButton.addEventListener("click", this.sealTheEntry.bind(this));
    this.create();
  }

  sealTheEntry() {
    let NumofActiveTasks = activeTasksElement.childElementCount;
    if (NumofActiveTasks == 0) {
      message("Please enter tasks for the day!", "info", "assets/img/sign.png");
      return;
    }
    isSealed = true;

    progressElement.value = 0;
    progressElement.max = NumofActiveTasks;

    let a = message(
      "Do you want to seal the day? No tasks can be added if you click Yes!",
      "confirm",
      "assets/img/warning.png",
      Form.confirm
    );

    tempformElement = this;
  }

  static confirm() {
    document.querySelector("header h1").textContent = "Today's Missions";
    document.querySelector(
      "#section-progress span"
    ).textContent = `${progressElement.value} / ${progressElement.max}`;
    tempformElement.form.parentElement.classList.add("hidden");
  }

  create() {
    this.form.addEventListener("submit", this.submitForm.bind(this));
  }

  submitForm(event) {
    event.preventDefault();
    let title;
    let flag;
    let detail = document.getElementById("section-form__detail").value.trim();
    let categories = [];
    let color;

    color = document.getElementById("section-form__color").value;

    const titleElement = document.getElementById("section-form__title");
    title = titleElement.value.trim();
    const titleValidator = new Validator("title", title);

    const flagElement = document.getElementById("section-form__flag");
    flag = flagElement.value;
    const flagValidator = new Validator("flag", flag);

    const categoryElements = document.querySelectorAll(
      "input[name='task-category'"
    );
    const categoryValidator = new Validator("category", categoryElements);
    for (let element of categoryElements) {
      if (element.checked) {
        categories.push(element.labels[0].textContent);
      }
    }

    if (titleValidator.result) {
      if (flagValidator.result) {
        if (categoryValidator.result) {
          message("Task is submitted", "info");
          new Task(title, flag, detail, categories, color);
          this.form.reset();
        } else {
          message(
            "Please choose at least one category for the task!",
            "info",
            "assets/img/warning.png"
          );
        }
      } else {
        message("No flag is selected!", "info", "assets/img/warning.png");
      }
    } else {
      message(
        "Please enter a title not more than 20 characters!",
        "info",
        "assets/img/warning.png"
      );
    }
  }
}

class Validator {
  constructor(element, value) {
    this.result;
    this.element = element;
    this.value = value;
    this.validate();
  }

  validate() {
    if (this.element == TITLE) {
      this.result =
        this.value.length > 20 || this.value.length == 0 ? false : true;
    } else if (this.element == FLAG) {
      this.result = flags[this.value] ? true : false;
    } else if (this.element == CATEGORY) {
      let checkedElements = 0;
      for (let element of this.value) {
        if (element.checked) {
          checkedElements++;
          break;
        }
      }
      this.result = checkedElements != 0 ? true : false;
    }
  }
}
let tempTaskelement;
class Task {
  constructor(taskTitle, taskFlag, taskDetail, taskCategories, taskColor) {
    this.taskTitle = taskTitle;
    this.taskFlag = taskFlag;
    this.taskDetail = taskDetail;
    this.taskCategories = taskCategories;
    this.id = idCount++;
    this.color = taskColor == "#ffffff" ? "#000000" : taskColor;
    this.add();
    this.DOMElement = document.getElementById(this.id);
    this.moreInfo();
  }

  add() {
    const cloneTask = document
      .getElementById("task-hub")
      .content.cloneNode(true);
    const divItem = cloneTask.querySelector("div");
    const headingItem = cloneTask.querySelector("h3");
    const flagItem = cloneTask.querySelector("img");
    const detailItem = cloneTask.querySelector("p");
    const categoryItems = cloneTask.querySelectorAll("span");
    const checkItem = cloneTask.querySelector("input");
    const deleteItem = cloneTask.querySelector("button");

    divItem.style.backgroundColor = this.color;
    divItem.style.borderColor = this.color;
    headingItem.style.color = this.color;

    divItem.id = this.id.toString();
    headingItem.textContent = this.taskTitle;
    flagItem.src = flags[this.taskFlag];
    flagItem.alt = this.taskFlag;
    detailItem.textContent = this.taskDetail;

    for (let i = 0; i < this.taskCategories.length; i++) {
      categoryItems[i].textContent = this.taskCategories[i];
      categoryItems[i].classList.remove("hidden");
      categoryItems[i].style.borderColor = this.color;
    }

    checkItem.addEventListener("change", this.switchSection.bind(this));

    deleteItem.addEventListener("click", this.delete.bind(this));

    activeTasksElement.append(cloneTask);
  }

  delete() {
    tempTaskelement = this;
    console.log(this);
    message(
      "Do you really want to remove the task?",
      "confirm",
      "assets/img/warning.png",
      Task.confirm
    );
  }

  static confirm() {
    tempTaskelement.DOMElement.remove();
    if (isSealed) {
      Task.progressUpdate("none");
    }
  }

  moreInfo() {
    let detailElement = this.DOMElement.querySelector("p");
    if (detailElement.scrollHeight > detailElement.clientHeight) {
      detailElement.classList.add("overflow");
      detailElement.addEventListener("click", () => {
        if (detailElement.classList.contains("more-info")) {
          detailElement.classList.remove("more-info");
        } else {
          detailElement.classList.add("more-info");
          setTimeout(() => {
            detailElement.classList.remove("more-info");
          }, 8000);
        }
      });
    }
  }

  switchSection(e) {
    if (!isSealed) {
      message(
        "If you completed the determination of the tasks, please seal the day first!",
        "info",
        "assets/img/warning.png"
      );
      e.target.checked = false;
      return;
    }
    if (e.target.checked) {
      Task.progressUpdate("+");
      activeTasksElement.removeChild(this.DOMElement);
      passiveTasksElement.append(this.DOMElement);
    } else {
      passiveTasksElement.removeChild(this.DOMElement);
      activeTasksElement.append(this.DOMElement);
      Task.progressUpdate("-");
    }
  }

  static progressUpdate(operation) {
    const progressText = document.querySelector("#section-progress span");
    if (operation == "+") {
      progressElement.value++;
    } else if (operation == "-") {
      progressElement.value--;
    } else {
      progressElement.max =
        activeTasksElement.childElementCount +
        passiveTasksElement.childElementCount;
      progressElement.value = passiveTasksElement.childElementCount;
    }

    if (
      activeTasksElement.childElementCount == 0 &&
      passiveTasksElement.childElementCount == 0
    ) {
      progressText.textContent = "";
      progressElement.max = 0;
      progressElement.value = 0;
      return;
    }

    progressText.textContent = `${progressElement.value} / ${progressElement.max}`;
    if (progressElement.value == progressElement.max) {
      message(
        "All the missions are accomplished!",
        "info",
        "assets/img/end.png"
      );
    }
  }
}

const formElement = document.getElementById("section-form__form");
let form = new Form(formElement);
