class Item {

    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = 0;
    }

    setQuantity(c) {
        this.quantity = c;
    }
}

class Menu {
    constructor() {
        // Yes, this is a hardcoded inventory (for now)
        this.items = [
            new Item('1', 'Hotdog', 4.00),
            new Item('2', 'Fries', 3.50),
            new Item('3', 'Soda', 1.50),
            new Item('4', 'Sauerkraut', 1.00),

        ];
    }

    // Lookup inventory item by it's `id` field.
    getItemById(item_id) {
        // Filter the inventory list by the id
        var respItemList = this.items.filter(i => i.id == item_id);

        // Throw an error if there is 0 or multiple items returned;
        if (respItemList.length != 1) {
            alert("Could not find a single item by that id (" + item_id + ")");
        } else {
            // Just return a single Item object
            return respItemList[0];
        }
    }

    showInventoryTable() {
        var menuTable = '<table class="table">';
        this.items.forEach(i => menuTable += '<tr><td>' + i.id + '</td><td>' + i.name + '</td><td>$' + i.price.toFixed(2) + '</td></tr>');
        menuTable += '</table>';
        return menuTable;
    }
}

class ShoppingCart {

    constructor() {
        this.items = [];
        this.tax = 6.25;
        this.subtotal = 0;
        this.total = 0;

        this.isDiscounted = false;
    }

    updateItem(i, q) {
        // If the item with the same id already exists in the current cart, then update the quantity, by adding the new quantity
        var fo = this.items.find(e => e.name == i.name);
        if (fo) {
            fo.quantity += q;
            // Update the cart items.
            this.items.map(itm => fo.name == itm.name || itm);
        } else {
            // No item found, so add this item with the new quantity
            i.quantity = q;
            this.items.push(i);
        }
    }

    getReceiptTable() {
        if (this.items.length == 0) {
            return 'There are no items in the cart. Nothing to check out.';
        }

        var content = '<table class="table">';
        this.items.forEach(i => {
            content += '<tr><td>' + i.quantity + ' ' + i.name + '</td><td class="text-end">$' + (i.price * i.quantity).toFixed(2) + '</td ></tr > ';
        });
        content += '<tr><td>Subtotal</td><td>$' + this.subtotal.toFixed(2) + ' ' + (this.isDiscounted ? '<small>discounted</small>' : '') + '</tr>';
        content += '<tr><td>Taxes</td><td>$' + (this.subtotal * (this.tax / 100)).toFixed(2) + ' <small>' + this.tax + '%</small></tr>';
        content += '<tr><th>Total</th><th>$' + this.total.toFixed(2) + '</th></tr>';
        content += '</table>';
        return content;
    }

    clear() {
        this.items = [];
    }

    recalculate() {
        // Determine how to calculate the subtotal
        var subTTL = (this.items.length == 0) ? 0
            : (this.items.length == 1) ? this.items[0].price * this.items[0].quantity
                : this.items.reduce((pv, cv) => (pv.price * pv.quantity) + (cv.price * cv.quantity));

        // Apply 20% discount, if subtotal is >= 20
        var discountedOrNotTotal = (subTTL < 20) ? subTTL : (subTTL * 0.9);

        // Set the discounted flag
        this.isDiscounted = !(discountedOrNotTotal == subTTL);

        // Calculate the taxes based on the subtotal value
        var taxes = discountedOrNotTotal * (this.tax / 100);
        // Add the taxes.
        this.total = discountedOrNotTotal + taxes;
        this.subtotal = discountedOrNotTotal;
    }
}