function SignIn(username, pass) {
  console.log("Hello There");
  // long version of xpath -- descendant-or-self::node() /child::button / child::repeat[contains(text(), 'sold')]
  let buttonXpath = "//button[contains(text(), 'Login')]";

  let xpathLogins = document.evaluate(buttonXpath, document, null);

  // iterate over the potential buttons
  if (xpathLogins.invalidIteratorState) {
    console.log("No login button or incorrect xpath/ Xpath is " + xpathLogins);
  } else {
    // Should only be one button that says login if there's multiple deal with it later
    loginButton = xpathLogins.iterateNext();
  }

  // the input fields are preceding siblings of the buttonXpath

  let siblingXpath = buttonXpath + "/preceding-sibling::input";
  let inputs = document.evaluate(siblingXpath, document, null);

  let userInput = null;
  let passInput = null;
  // check if we've retrieved valid inputs
  if (inputs.invalidIteratorState) {
    console.error("NO Siblings or incorrect xpath. Xpath is " + siblingXpath);
  } else {
    // select the two inputs (should be 2 unless website was changed)
    let input1 = inputs.iterateNext();
    let input2 = inputs.iterateNext();

    //  check if any are null
    if (input1 != null && input2 != null) {
      // set each input based on its name
      userInput = input1.name == "username" ? input1 : input2;
      passInput = userInput == input1 ? input2 : input1;
    } else {
      console.error(
        "At least one of the inputs is missing. \n input1: " +
          input1 +
          "\n input2: " +
          input2
      );
    }
  }

  // now that we have the login button and the required inputs lets loginButton
  userInput.value = username;
  passInput.value = pass;
  loginButton.click();
}

username = "rodrigoohimself@gmail.com";
password = "Eliteholdings!";

SignIn(username, password);
