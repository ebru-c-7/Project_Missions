class MessageBox extends HTMLElement {
  constructor() {
    super();
    this.isActive = false;
    this._imgSrcDefault =
      "https://w7.pngwing.com/pngs/999/91/png-transparent-computer-icons-text-symbol-info-miscellaneous-sign-smile.png";
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <style> 
            * {
                box-sizing: border-box;
            }

            #container {
                position: absolute;
                z-index: 10;
                width: 60vw;
                top: 20vh;
                left: 0;
                margin: 0 auto;
                right: 0;
                background: white;
                border: 1px black solid;
                height: 30vh;
                display: flex;
                color: black;
                align-items: flex-start;
                padding: 20px;
                border-style: dotted;
                border-color: darkgray;
                border-width: 3px;
                border-radius: 100px;
                transition: all 0.3s ease-out;
                // min-width: 400px;
                max-width: 525px;
            }

            :host([active="false"]) #backdrop,
            :host([active="false"]) #container {
                display: none;
            }

            #backdrop {
                z-index: 9;
                background-color: gray;
                height: 100%;
                width: 100%;
                position: fixed;
                top: 0;
                left: 0;
                background-color: rgba(0,0,0,0.3);
            }

            img {
                height: 70%;
                margin: 20px;
            }

            #section-text {
                display: flex;
                flex-direction: column;
                height: 100%;
                // border: 1px solid black;
                justify-content: space-between;
                align-items: start;
                width: 55%;
            }

            button {
                width: 100px;
                height: 30px;
                background: transparent;
                border: 3px solid darkgray;
                border-radius: 10px;
                font-family: unset;
                font-weight: 900;
            }

            button:focus {
                outline: none;
                border: 3px solid black;
            }

            .hidden {
                display: none;
            }

            #actions {
                width: 90%;
                display: flex;
                justify-content: space-between;
            }

            @media (max-width: 780px) {
                #container {
                    width: 100%;
                    font-size: 16px;
                }
            
                img {
                    width: unset;
                    height: 50%;
                    margin-left: 0;
                }

                button {
                    width: 80px;
                }
            }

        </style>
        <div id="backdrop"></div>
        <div id="container">
            <img src="">
            <section id="section-text">
                <slot></slot>
                <div id="actions">
                    <button id="button-ok">GOT IT!</button>
                    <button id="button-yes">YES</button>
                    <button id="button-no">NO</button>
                </div>
            </section>
        </div>
    `;
    const slot = this.shadowRoot.querySelector("slot");
    slot.addEventListener("slotchange", e => {
      slot.assignedNodes();
    });

    const backdrop = this.shadowRoot.querySelector("#backdrop");
    const okButton = this.shadowRoot.querySelector("#button-ok");
    const confirmButton = this.shadowRoot.querySelector("#button-yes");
    const cancelButton = this.shadowRoot.querySelector("#button-no");

    backdrop.addEventListener("click", this._cancel.bind(this));
    okButton.addEventListener("click", this._cancel.bind(this));
    confirmButton.addEventListener("click", this._confirm.bind(this));
    cancelButton.addEventListener("click", this._cancel.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.getAttribute('active') == "true") {
      this.isActive = true;
    } else {
      this.isActive = false;
    }
  }

  static get observedAttributes() {
    return ['active', 'type', 'img'];
  }

  _cancel() {
    this.hide();
    const cancelEvent = new Event("cancel");
    this.dispatchEvent(cancelEvent);
    // const cancelEvent = new Event("cancel", { bubbles: true, composed: true });
    // event.target.dispatchEvent(cancelEvent);
  }

  _confirm() {
    this.hide();
    const confirmEvent = new Event("confirm");
    this.dispatchEvent(confirmEvent);
  }

  hide() {
    if (this.getAttribute('active') == "true") {
      this.setAttribute('active', "false");
    }
    this.isActive = false;
  }

  open() {
    this.setAttribute('active', 'true');
    this.isActive = true;
  }

  connectedCallback() {
    //loading img
    const imgElement = this.shadowRoot.querySelector("img");
    let imgUrl = this.getAttribute("img");
    this._testImg(imgUrl).then(
      success => {
        imgElement.src = imgUrl;
      },
      fail => {
        imgElement.src = this._imgSrcDefault;
      }
    );

    //getting msg box type
    let type = this.getAttribute("type");
    if (type == "confirm") {
      this.shadowRoot.querySelector("#button-ok").classList.add("hidden");
    } else if (type == "info") {
      this.shadowRoot.querySelector("#button-yes").classList.add("hidden");
      this.shadowRoot.querySelector("#button-no").classList.add("hidden");
    }
  }

  _testImg(url) {
    const imgPromise = new Promise((resolve, reject) => {
      const imgElement = new Image();
      // When image is loaded, resolve the promise
      imgElement.addEventListener("load", () => {
        resolve();
      });

      // When there's an error during load, reject the promise
      imgElement.addEventListener("error", () => {
        reject();
      });
      // Assign URL
      imgElement.src = url;
    });

    return imgPromise;
  }
}

customElements.define("ec-messagebox", MessageBox);
