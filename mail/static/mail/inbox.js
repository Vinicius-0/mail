document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email(email) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";

  // Clear out composition fields
  if (email.body != undefined) {
    document.getElementById("compose-recipients").value = email.sender;
    if (email.subject.substring(0, 4) === "Re: ") {
      document.getElementById("compose-subject").value = email.subject;
    } else {
      document.getElementById("compose-subject").value = "Re: " + email.subject;
    }
    document.getElementById(
      "compose-body"
    ).value = `\n\nOn ${email.timestamp} ${email.sender} wrote: \n${email.body}\n`;
  } else {
    document.querySelector("#compose-recipients").value = "";
    document.querySelector("#compose-subject").value = "";
    document.querySelector("#compose-body").value = "";
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      // console.log(emails);
      emails.forEach((element) => {
        showEmails(element, mailbox);
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#compose-form").onsubmit = function () {
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: document.getElementById("compose-recipients").value,
        subject: document.getElementById("compose-subject").value,
        body: document.getElementById("compose-body").value,
      }),
    })
      .then((response) => response.json())
      .then(() => load_mailbox("sent"))
      .catch((error) => {
        console.log("Error:", error);
      });
    return false;
  };
});

function showEmails(email, mailbox) {
  // create email div
  const emailItem = document.createElement("div");
  emailItem.className =
    "list-group-item d-flex justify-content-between align-items-center";
  emailItem.id = "showEmailsItem";

  if (email.read === false) {
    emailItem.style.backgroundColor = "#fff";
  } else {
    emailItem.style.backgroundColor = "#ddd";
  }

  emailItem.innerHTML = `${email.sender.bold()}  ${email.subject.anchor()}  ${email.timestamp.anchor()}`;

  if (mailbox != "sent") {
    // create archive button
    const emailButton = document.createElement("img");
    emailButton.id = "archive-button";
    emailButton.style.width = "30px";
    emailButton.title = "Archive";
    emailButton.src = "static/mail/archive_icon_128534.png";
    emailItem.append(emailButton);

    emailButton.addEventListener("click", function () {
      changeArchived(email);
      event.stopPropagation();
    });
  }

  emailItem.addEventListener("click", function () {
    loadSpecificEmail(email);
  });

  document.querySelector("#emails-view").append(emailItem);
}

function loadSpecificEmail(email) {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";
  document.querySelector("#email-view-body").style.whiteSpace = "pre-wrap";

  changeToRead(email);

  document.getElementById("email-view-from").innerHTML = email.sender;
  document.getElementById("email-view-to").innerHTML = email.recipients;
  document.getElementById("email-view-subject").innerHTML = email.subject;
  document.getElementById("email-view-date").innerHTML = email.timestamp;
  document.getElementById("email-view-body").innerHTML = email.body;

  document
    .querySelector("#reply")
    .addEventListener("click", () => compose_email(email));

  console.log(email);
}

function changeToRead(email) {
  fetch(`/emails/${email.id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function changeArchived(email) {
  fetch(`/emails/${email.id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !email.archived,
    }),
  });
  location.reload();
}
