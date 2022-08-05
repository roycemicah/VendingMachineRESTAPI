$(document).ready(function () {
    loadInventory();
    insertMoney();
    getChange();
    makePurchase();
})

const inventory = $('#vendingMachineInventory');
const itemName = $('#itemName');
const moneyDisplay = $('#moneyDisplay');
const returnChange = $('#returnChange');
const displayMessage = $('#displayMessage');
const displayChangeOutput = $('#displayChange');

function loadInventory() {
    $('#errorMessages').empty();
    clearInventory();
    var itemRows = inventory;

    $.ajax({
        type: 'GET',
        url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
        success: function (itemArray) {
            $.each(itemArray, function (index, item) {
                let id = item.id;
                let name = item.name;
                let price = (item.price).toFixed(2);
                let quantity = item.quantity;

                let dynamicContent = '<button class="btn btn-outline col-md-3 button" onclick="selectItem(' + id + ')">'
                dynamicContent += '<p class="displayId">' + id + '</p>'
                dynamicContent += '<p>' + name + '</p>'
                dynamicContent += '<p>$' + price + '</p>'
                dynamicContent += '<p>' + 'Quantity Left:' + ' ' + quantity + '</p>'
                dynamicContent += '</button>';

                // item card created
                itemRows.append(dynamicContent);
            })
        },
        error: function () {
            $('#errorMessages')
                .append($('<li>')
                    .attr({ class: 'list-group-item list-group-item-danger' })
                    .text('Error calling web service. Please try again later.'));
        }
    })
}

function makePurchase() {
    $('#makePurchase').click(function (event) {
        displayMessage.val('');

        if (itemName.val() == '') {

            displayMessage.val('Please make a selection');
            displayChangeOutput.val('');
            return false;

        } else {

            var id = itemName.val();
            balance = moneyDisplay.val();

            $.ajax({
                type: 'POST',
                url: 'http://vending.us-east-1.elasticbeanstalk.com/money/' + balance + '/item/' + id,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                'dataType': 'json',
                success: function (change) {
                    changeMessage(change)
                    displayMessage.val('Thank You!!!');
                    loadInventory();
                },
                error: function (xhr) {
                    let error = JSON.parse(xhr.responseText);
                    displayMessage.val(error.message);
                    loadInventory();
                }
            });

        }
    });
}

function selectItem(id) {
    itemName.val(id);
    displayMessage.val('');
    displayChangeOutput.val('');
}

function insertMoney() {
    $('#insertDollar').click(function (event) {
        balance = + moneyDisplay.val();
        balance = balance + 1.00;
        moneyDisplay.val(balance.toFixed(2));
        displayChangeOutput.val('');
    });
    $('#insertQuarter').click(function (event) {
        balance = + moneyDisplay.val();
        balance = balance + 0.25;
        moneyDisplay.val(balance.toFixed(2));
        displayChangeOutput.val('');
    });
    $('#insertDime').click(function (event) {
        balance = + moneyDisplay.val();
        balance = balance + 0.10;
        moneyDisplay.val(balance.toFixed(2));
        displayChangeOutput.val('');
    });
    $('#insertNickel').click(function (event) {
        balance = + moneyDisplay.val();
        balance = balance + 0.05;
        moneyDisplay.val(balance.toFixed(2));
        displayChangeOutput.val('');
    });
}

function getChange() {
    returnChange.click(function (event) {

        if (moneyDisplay.val() == '') {
            displayChangeOutput.val('No Change Inserted');
            itemName.val('');
            displayMessage.val('');
            return false;
        }

        balance = + moneyDisplay.val();
        balance = balance * 100;

        var numQuarters = Math.floor(balance / 25);
        balance = balance - (numQuarters * 25);
        var numDimes = Math.floor(balance / 10);
        balance = balance - (numDimes * 10);
        var numNickels = Math.floor(balance / 5);
        var numPennies = Math.floor(balance - (numNickels * 5));

        changeMessage({ "quarters": numQuarters, "dimes": numDimes, "nickels": numNickels, "pennies": numPennies });
        displayMessage.val('');

    });
}

function changeMessage(change) {
    let message = "";
    
    for (denomination in change) {
        if (change[denomination] > 0) {
            let count = change[denomination];

            if (denomination == "pennies") {
                count > 1 ? message += count + " " + denomination : message += count + " " + " penny";
            } else {
                count > 1 ? message += count + " " + denomination + " " : message += count + " " + denomination.slice(0, -1) + " ";
            }
        }
    }
    displayChangeOutput.val(message);
    moneyDisplay.val('0.00');
    itemName.val('');
}

function clearInventory() {
    inventory.empty();
}
