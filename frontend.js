const web3authSdk = window.Web3auth;
let web3AuthInstance = null;

(async function init() {
  $(".btn-logged-in").hide();
  $("#sign-tx").hide();

  web3AuthInstance = new web3authSdk.Web3Auth({
    chainConfig: { chainNamespace: "eip155" },
    clientId: "YOUR_CLIENT_ID_HERE", // get your clientId from https://developer.web3auth.io
  });

  subscribeAuthEvents(web3AuthInstance);

  await web3AuthInstance.initModal();
  console.log("web3AuthInstance", web3AuthInstance, web3AuthInstance.provider);
  if (web3AuthInstance.provider) {
    $(".btn-logged-in").show();
    $(".btn-logged-out").hide();
    if (web3AuthInstance.connectedAdapterName === "openlogin") {
      $("#sign-tx").show();
    }
  } else {
    $(".btn-logged-out").show();
    $(".btn-logged-in").hide();
  }
})();

function subscribeAuthEvents(web3auth) {
  web3auth.on("connected", (data) => {
    console.log("Yeah!, you are successfully logged in", data);
  });

  web3auth.on("connecting", () => {
    console.log("connecting");
  });

  web3auth.on("disconnected", () => {
    console.log("disconnected");
  });

  web3auth.on("errored", (error) => {
    console.log("some error or user have cancelled login request", error);
  });

  web3auth.on("MODAL_VISIBILITY", (isVisible) => {
    console.log("modal visibility", isVisible);
  });
}

$("#login").click(async function (event) {
  try {
    const provider = await web3AuthInstance.connect();
    console.log("provider after login", provider);
    $(".btn-logged-out").hide();
    $(".btn-logged-in").show();
  } catch (error) {
    console.error(error.message);
  }
});

$("#logout").click(async function (event) {
  try {
    await web3AuthInstance.logout();
    $(".btn-logged-in").hide();
    $(".btn-logged-out").show();
  } catch (error) {
    console.error(error.message);
  }
});

$("#get-user-info").click(async function (event) {
  try {
    const user = await web3AuthInstance.getUserInfo();
    $("#code").text(JSON.stringify(user || {}, null, 2));
  } catch (error) {
    console.error(error.message);
  }
});

$("#get-accounts").click(async function (event) {
  try {
    const web3 = new Web3(web3AuthInstance.provider);
    const accounts = await web3.eth.getAccounts();
    $("#code").text(JSON.stringify(["Eth accounts", accounts], null, 2));
  } catch (error) {
    console.error(error.message);
  }
});

$("#get-balance").click(async function (event) {
  try {
    const web3 = new Web3(web3AuthInstance.provider);
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    $("#code").text(JSON.stringify(["Eth balance", balance], null, 2));
  } catch (error) {
    console.error(error.message);
  }
});

$("#sign-message").click(async function (event) {
    try {
 
      // The contents of the message can be anything
      const rawMessage = 'Spaghetti';
      const provider = web3AuthInstance.provider;
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const msg = web3.eth.accounts.hashMessage(rawMessage);
      const handleSignature = async (err, signed) => {
        console.log("handling sig:", signed);
        console.log("actual address:", address);
          let recoveredAddress = await web3.eth.accounts.recover(rawMessage, signed);
          console.log('recovered address:', recoveredAddress);

          if (!err) {
              const fetchOpts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, message: rawMessage, signed: signed })
              };
              let recoveredAddress = await web3.eth.accounts.recover(msg, signed);
              console.log('recovered address:', recoveredAddress);
              fetch('http://localhost:6969/login', fetchOpts).then(res => {
              if (res.status >= 200 && res.status <= 300) {
                  return res.json().then((result) => {
                    $("#code").text(JSON.stringify(["Eth sign message => true", res.body], null, 2));
                    return result;
                  });
              } else {
                  throw Error(res.statusText);
              }
              }).then(json => {
              // Auth succeeded
              $("#code").text(JSON.stringify(["Eth sign message => true", json], null, 2));
              console.log('Authed');
              }).catch(err => {
              // Auth failed
              console.log('Auth failed: ', err);
              })
          }
      };
      
      web3.eth.sign(msg, address, handleSignature);
    } catch (error) {
      console.error(error.message);
    }
  });
  
  $("#sign-tx").click(async function (event) {
    try {
      // const provider = web3AuthInstance.provider;
      // const web3 = new Web3(provider);      
      // const accounts = await web3.eth.getAccounts();
      // const txRes = await web3.eth.signTransaction({
      //   from: accounts[0],
      //   to: accounts[0],
      //   value: web3.utils.toWei("0.01"),
      // });
    
      // The contents of the message can be anything
      const rawMessage = 'Some message';
      const msg = web3.eth.accounts.hashMessage(rawMessage);
      const provider = web3AuthInstance.provider;
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const handleSignature = (err, signed) => {
          console.log("handling sig");
          if (!err) {
              const fetchOpts = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address, msg, signed })
              };
          
              fetch('http://localhost:6969/login', fetchOpts).then(res => {
              if (res.status >= 200 && res.status <= 300) {
                  return res.json();
              } else {
                  throw Error(res.statusText);
              }
              }).then(json => {
              // Auth succeeded
              console.log('Authed');
              }).catch(err => {
              // Auth failed
              console.log('Auth failed');
              })
          }
      };
      
      web3.personal.sign(msg, address, handleSignature);
      $("#code").text(JSON.stringify(txRes));
  
    } catch (error) {
      console.error(error.message);
    }
  });

$("#send-tx").click(async function (event) {
  try {
    const provider = web3AuthInstance.provider;
    const web3 = new Web3(provider);      
    const accounts = await web3.eth.getAccounts();

    const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
    const txRes = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[0],
      value: web3.utils.toWei("0.01"),
    });
    $("#code").text(JSON.stringify(txRes));

  } catch (error) {
    console.error(error.message);
  }
});

