// this is a comment
/* This is a multiline comment in JavaScript. Use Shift+Alt+A */
/* END ALL LINES WITH A SEMI-COLON */

//importing assets
import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

/* since we are not using React.js we need to target html manually */
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

/* calling out a variable */
let loadInterval;

/* function to load our message */
/* create an element textContent empty to ensure it will be empty at the start */
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += ".";

    // If the loading indicator has reached thee dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

/* function to create the typewriting illusion */
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

/* Generate a unique Id for every single message to be able to map over them */
function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  // return "id-${timestamp}-${hexadecimalString}";
  return `id-${timestamp}-${hexadecimalString}`;
}

/* Implementing the chat color stripes */
function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

/* Implementing the handle submit function, both user's and bot's, this is going to be the trigger to get the AI generated response.
We will create an async function with an event as the only parameter.  The default is that when you submit a form the browser will reload and, we do not want that, so we need to prevent it (see line 74) */

const handleSubmit = async (e) => {
  e.preventDefault();
  // get the data that we typed into the form, then pass in the form from the html area
  const data = new FormData(form);

  // GENERATE A NEW USER'S CHAT STRIPE.  We pass in "false" as it is not the AI
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // clear the text area input so that we can type more in later or
  form.reset();

  // GENERATE THE BOT'S CHAT STRIPE
  // generate a unique ID for its message
  const uniqueId = generateUniqueID();
  // generate a new bot's chat stripe.  We pass in "true" as it is the AI
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // as the user is going to type we want to keep scrolling down to be able to see that message...
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // fetch the newly created div...
  const messageDIV = document.getElementById(uniqueId);

  // turn on the loader
  loader(messageDIV);

  // fetch data from server -> bot's response
  const response = await fetch("http://localhost:5000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDIV.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDIV, parsedData);
  } else {
    const err = await response.text();

    messageDIV.innerHTML = "Something went wrong in client side...";
    alert(err);
  }
};

/* to be able to see the changes that we made to our handle "submit", we need to call it*/
form.addEventListener("submit", handleSubmit);
// listen for the Enter key event. #13 is the Enter key...
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
