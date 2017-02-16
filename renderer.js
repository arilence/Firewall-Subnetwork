/***---------------------------------------------------------------------------------------
--      SOURCE FILE:        renderer.js - main renderer file for visual operations
--
--      PROGRAM:            firewall_subnetwork
--
--      FUNCTIONS:          quit()
--                          buttonClick()
--                          executeBash()
--
--      DATE:               February 13, 2016
--
--      REVISION:           (Date and Description)
--
--      DESIGNERS:          Anthony Smith and Colin Bose
--
--      PROGRAMMERS:        Anthony Smith and Colin Bose
--
--      NOTES:
--      This file takes care of communicating between the main application and all user
--      interface interactions.
--
--      The two buttons (Run and Quit) on the user interface are trigger in this file
--      and then a synchronous call is made to the main application.
---------------------------------------------------------------------------------------**/
const {ipcRenderer} = require('electron')

// Setup Button Listeners
resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function() { buttonClick(false, true); });
executeFirewallButton = document.getElementById("executeFirewallButton");
executeFirewallButton.addEventListener("click", function() { buttonClick(false, false); });
executeClientButton = document.getElementById("executeClientButton");
executeClientButton.addEventListener("click", function() { buttonClick(true, false); });
quitButton = document.getElementById("quitButton");
quitButton.addEventListener("click", quit);

// Reference input boxes
searchServer       = document.getElementById("search-server");
nameServers        = document.getElementById("name-servers");
ipOutboundFirewall = document.getElementById("ip-outbound-firewall");
ipInternalClient   = document.getElementById("ip-internal-client");
ipInternalGateway  = document.getElementById("ip-internal-gateway");
ipInternalNetwork  = document.getElementById("ip-internal-network");
nameExternalCard   = document.getElementById("name-external-card");
nameInternalCard   = document.getElementById("name-internal-card");
tcpAllowedIn       = document.getElementById("tcp-allowed-in");
tcpAllowedOut      = document.getElementById("tcp-allowed-out");
udpAllowedIn       = document.getElementById("udp-allowed-in");
udpAllowedOut      = document.getElementById("udp-allowed-out");
icmpAllowed        = document.getElementById("icmp-allowed");


/***---------------------------------------------------------------------------------------
-- FUNCTION:   quit
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- Handles sending a signal to the main application to close
--------------------------------------------------------------------------------------***/
function quit() {
  ipcRenderer.sendSync('quit-app');
}


/***---------------------------------------------------------------------------------------
-- FUNCTION:   buttonClick
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- Handles both execution button presses (Setup as Firewall, Setup as Client) by setting
-- the isClient variable. After generation and execution has finished, a modal on the
-- user interface is displayed with the result (Error / Success).
--------------------------------------------------------------------------------------***/
function buttonClick(isClient, isReset) {
  returnValue = executeBash(isClient, isReset);

  $('#modal .modal-header').removeClass('bg-danger');
  $('#modal .modal-header').removeClass('bg-success');

  if (!returnValue.code) {
    $('#modal #modalLabel').html('Error!');
    $('#modal .modal-header').addClass('bg-danger');
  } else {
    $('#modal .modal-header').addClass('bg-success');
  }
  $('#modal .modal-body').html(returnValue.text);
  $('#modal').modal();
}


/***---------------------------------------------------------------------------------------
-- FUNCTION:   executeBash
-- DATE:       13/02/2017
-- REVISIONS:  (V1.0)
-- DESIGNER:   Anthony Smith
-- PROGRAMMER: Anthony Smith
--
-- NOTES:
-- Handles both execution button presses (Setup as Firewall, Setup as Client) and sends
-- a signal to the main application to generate a bash script based on the request. After
-- the generation is complete, the application then executest the script inline.
--------------------------------------------------------------------------------------***/
function executeBash(isClient, isReset) {
  var data = {
    'isClient'           : isClient,
    'isReset'            : isReset,
    'inputs'             : {
      'searchServer'       : searchServer.value,
      'nameServers'        : nameServers.value,
      'ipOutboundFirewall' : ipOutboundFirewall.value,
      'ipInternalClient'   : ipInternalClient.value,
      'ipInternalGateway'  : ipInternalGateway.value,
      'ipInternalNetwork'  : ipInternalNetwork.value,
      'nameExternalCard'   : nameExternalCard.value,
      'nameInternalCard'   : nameInternalCard.value,
      'tcpAllowedIn'       : tcpAllowedIn.value,
      'tcpAllowedOut'      : tcpAllowedOut.value,
      'udpAllowedIn'       : udpAllowedIn.value,
      'udpAllowedOut'      : udpAllowedOut.value,
      'icmpAllowed'        : icmpAllowed.value,
    }
  }

  generatedScript = ipcRenderer.sendSync('generate-bash', data);
  if (!generatedScript) {
    return { 
      'code': false,
      'text': "Generating the bash script failed. Please check your input values."
    }
  }

  success = ipcRenderer.sendSync('execute-bash', generatedScript, isClient, isReset);
  if (!success) {
    return { 
      'code': false,
      'text': "Something went wrong with executing the script. Please check your input values"
    }
  }

  if (isClient) {
    return { 
      'code': true,
      'text': "The Client machine has been setup successfully."
    }
  } else {
    if (isReset) {
      return {
        'code' : true,
        'text' : "The Firewall has been reset successfully."
      }
    }
    return { 
      'code': true,
      'text': "The Firewall has been setup successfully."
    }
  }
}
