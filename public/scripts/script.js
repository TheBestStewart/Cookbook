function loggedIn (){
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn === true) {
      window.location.replace("home.html");
    } else {
      window.location.replace("welcome.html")
    }
}