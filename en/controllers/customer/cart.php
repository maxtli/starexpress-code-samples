<?php

class Cart extends Controller{

    use SearchListController;

    function __construct() {
        parent::__construct();
        $this->fn_checkCustomerCredentials('cart');
        $this->SLC = 'sc';
        $this->view->catalog = true;
    }
    
    function index() {
        // $this->view->products = $this->model->getItems($this->uid[0]);
        $this->view->cart = $this->model->getCart($this->uid['AccountID']);
        foreach($this->view->cart as $key => $row)
            $this->view->cart[$key]['Imgsrc'] = $this->fn_findPictures($row['CID'], $row['Color'], false);
        $this->view->pageDetails = [
            "title" => "My Cart", 
            "css" => ["innerstyles.css", "customer/store/cart.css"],
            "js" => "customer/store/cart.js"
        ];
        
        $this->view->render('customer/store/cart.php', true, false);
    }

    function a_editQty() {
        $qty = Utils::validate($_GET['qty'], 'qty');
        $scid = Utils::validate($_GET['scid'], 'qty');
        $this->model->editQty($this->uid['AccountID'], $qty, $scid);
    }

    function a_remove() {
        $rows = $this->fn_validateOperation('cart', [0], [0]);
        $this->model->remove(array_column($rows, 0));
    }

    function fn_validateCart($row) {
        $row[0] = Utils::validate($row[0], 'qty');
        $this->model->getId('ShoppingCarts', $row[0], $this->uid['AccountID']);
        return $row;
    }

    function checkout() {
        Session::unsets('checkout_order');
        $entries = $_POST['scinfo'] ? array_column($this->fn_validateOperation('checkout', [0], [0]), 0) : $this->model->checkOverfillCart($this->uid['AccountID']);
        $this->view->cart = $this->model->getCart($this->uid['AccountID'], $entries);
        foreach($this->view->cart as $key => $row)
            $this->view->cart[$key]['Imgsrc'] = $this->fn_findPictures($row['CID'], $row['Color'], false);
        $this->view->price = array_reduce($this->view->cart, function($acc, $cur) {return $acc + ($cur['Quantity'] * $cur['Price']); }, 0);
        $this->view->bal = $this->model->getBalance($this->uid[0], 1);
        if($this->view->price / 100 <= $this->view->bal) {
            $this->view->key = random_int(0, 1000000);
            Session::set('checkout_order', ['key' => $this->view->key, 'entries' => $entries, 'price' => $this->view->price]);
        }
        $this->view->pageDetails = [
            "title" => "Checkout", 
            "css" => ["innerstyles.css", "customer/store/cart.css"],
            "js" => "customer/store/checkout.js"];
        $this->view->render('customer/store/checkout.php', true, false);
    }

    function fn_validateCheckout($row) {
        $this->model->checkOverfillItem($this->uid['AccountID'], $row[0]);
        return $row;
    }

    function a_checkout() {
        ['key' => $key, 'entries' => $entries, 'price' => $price] = Session::get('checkout_order');
        strval($key) === $_POST['key'] ?: Utils::error();
        foreach($entries as $entry)
            $this->model->checkOverfillItem($this->uid['AccountID'], $entry);
        $this->model->checkout($entries, $price);
    }
    
    function a_getInfo($id){
        $return = $this->model->getInfo(json_decode($id));
        echo json_encode($return);
    }
    
    function a_changeQuantity($a){
        $a = json_decode($a, true);
        $shoppingCartId = $this->model->getItems($this->uid[0])[$a['id']]["ID"];
        $this->model->changeQuantity($shoppingCartId, $a['newVal']);
    }

} 