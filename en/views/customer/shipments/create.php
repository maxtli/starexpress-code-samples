<div id="c_overlay" class="c_t_blue" hidden>
    <div id="c_overlay-box">
        <div id="deleteitemarea">
            Are you sure you want to delete this item from your package?<br>
            <button class="c_button-bg c_t_red" id="yesdeletebutton">Yes, DELETE it</button>
            <button class="c_button-bg c_t_green" id="nodeletebutton">No, KEEP it</button>
        </div>
        <div id="warehousechangearea">
            Are you sure you want to change your warehouse? All items already declared will be cleared.<br>
            <button class="c_button-bg c_t_green" id="yeschangewarehousebutton">Yes, change warehouse</button>
            <button class="c_button-bg c_t_yellow" id="nochangewarehousebutton">No, keep warehouse</button>
        </div>
        <div id="z_invcontentbox" class="c_t_green"><div class="j_load"><div></div></div></div>
    </div>
</div>
<div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
<div class="c_title">
    <button class="c_button" id="j_nav">>></button>
    <button class="c_button c_t_yellow j_link" data-url="uploadOrders/orders"<?php if ($this->notif || empty(Session::get('displayOrderData'))) echo ' disabled'; ?>>Continue Uploading Orders</button>
    Create New Package
</div>
<?php require $this->vUrl . 'customer/menu.php' ?>
<div class="c_content" id="maincontentarea">
    <div class="c_box-c" id="c_box-main">
        <div>
            <div class="c_tab c_t_yellow">Declare Package</div>
            <div class="c_tab c_t_green j_link" data-url="uploadOrders">Upload Taobao Orders</div>
        </div>
        <div class="c_box-f c_t_yellow" id="pkcreatearea">
            <table style="width: 100%; table-layout: fixed">
            <tbody id="j_dy-form"></tbody>
                <tr>
                    <td class="c_L-bold" style="padding-top: 20px" colspan="2">Package Content Details</td>
                </tr>
                <tr>
                    <td class="pkgcontentbox c_t_red" colspan="2">
                        <label class="radiocont" style="float: left"><input type="radio" class="moderadio" form="submitshipmentform" name="mode" value="inv">Select Package Contents from Inventory<span class="radiomark"></span></label>
                        <label class="radiocont" style="float: right"><input type="radio" class="moderadio" form="submitshipmentform" name="mode" value="dec">Declare Package Contents<span class="radiomark"></span></label>
                    </td>
                </tr>
                <tr class="pkmode_inv c_row-ipt" hidden>
                    <td colspan="2" style="padding: 20px"><button class="c_button" id="selectinvbutton">Select Inventory Items...</button></td>
                </tr>
                <tr class="pkmode_inv" hidden>
                    <td colspan="2">
                        <table cellspacing="0" class="pkgcontentbox" id="invbottomcontentbox">
                            <tr><th class="c_L-bold" colspan="6">Added Items</th></tr>
                            <tr>
                                <td style="padding: 5px 20px"><table cellspacing="0" class="c_table-s c_center" id="invtable">
                                    <tr class="c_table-head-pd">
                                        <td>
                                            Qty
                                        </td>
                                        <td>
                                            Category
                                        </td>
                                        <td>
                                            Brand
                                        </td>
                                        <td>
                                            Item Name
                                        </td>
                                        <td>
                                            UPC
                                        </td>
                                        <td>
                                            Price
                                        </td>
                                    </tr>
                                </table></td>
                            </tr>
                            <tr>
                                <td colspan="10" id="invtotalvaluecell">
                                    <div class="c_box-pr">Total Value: <a class="j_i-cy"></a><a id="j_i-pc-inv">0</a></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tbody class="pkmode_dec" id="j_dy-form2" hidden></tbody>
                <tr class="pkmode_dec" hidden>
                    <td colspan="2">
                        <?php $this->productSettings = ['heading' => 'Add an Item to Package', 'addbutton' => 'Add Item',
                            'clearbutton' => 'Clear', 'color' => 'blue', 'postval' => true];
                        require $this->vUrl . 'product.php'; ?>
                    </td>
                </tr>
            </table>
            <form id="submitshipmentform"></form>
        </div>
        <div class="c_box-f c_t_yellow" id="paymentcurrencyarea" hidden>
            <b>Select Payment Currency</b><br>
            <div class="inputfield">
                <select class="c_input-n" form="submitshipmentform" id="j_LX-Currency" name="Currency" required><option value="">Select Currency...</option></select>
                <button class="pkmode_inv c_button" id="invpricebutton" disabled hidden>Validate</button>
                <button class="pkmode_dec c_button" id="decpricebutton" disabled hidden>Validate and Get Price</button><br><br>
                <p style="font-size: 20px">Preferred Currency: <a class="j_i-cy"></a></p>
                <a class="c_L-err" id="createerrorlabel" hidden><br>There were errors in your form submission. Please scroll up to fix them.</a>
                <div class="c_hline">Current Balance:</div>
                <div class="c_L-bal"><?php foreach($this->balance as $key => $value) echo '<a class="j_i-bal" id="j_i-bal-cy-' . $key . '" hidden>' . $value . '</a>' ?><a class="j_i-bal" id="j_i-bal-0" hidden>0</a></div>
            </div>
        </div>
        <div class="c_box-f c_t_yellow" id="packagesummaryarea" hidden>
            <div class="c_L-step">My Package</div><br><br>
            <table class="c_table-idr" id="a_summarytable"></table>
            <button class="c_button c_t_yellow" id="editpackagebutton">Edit Package</button>
        </div>
        <div class="c_box-f c_t_green" id="paymentinvnoticearea" hidden>
            <div class="c_L-step">Finalize</div>
            <div id="paymentfeebox">
                <p>Unit Price: <a class="j_i-cy"></a><a class="j_i-pc-payment" id="j_i-pc-invunit">**Error**</a><br></p>
                <div class="exchangecurrencyarea" id="invexchangecurrencyarea" hidden>
                    <p>Exchange Rate: <a class="j_i-pc-payment" id="j_i-exc-inv">**Error**</a><br>
                    Your Unit Price: <a class="j_i-pc-payment" id="j_i-pc-invexcunit">**Error**</a><br></p>
                </div>
                <div class="c_hline"><p>Final Price: To be determined based on weight</p></div>
            </div>
            <br><br>For packages created from your inventory, we cannot determine the weight of your package and the appropriate price until it is boxed. 
            If you press "Place Package Order," you will be charged a non-refundable security deposit of <a class="paymentfeeindic">**Error**</a>. 
            Your package will be prepared and a price will be provided within 24 hours, and you will be allowed to approve or cancel the package. If you approve the package, your deposit will be applied to your package cost and your 
            account balance will be deducted the rest of the package price.<br><br>
            <label><input type="checkbox" id="invconsentbox" name="consent"> I understand that <a class="paymentfeeindic">**Error**</a> will be deducted from my account balance at this time and may not be refunded upon cancellation.</label><br><br>
            <button class="c_button" id="finalinvcreatebutton" disabled>Place Package Order</button>
            <a class="c_L-err" id="invbalanceerrorlabel" hidden><br>You do not have enough balance in your account to pay the security deposit for this package.</a>
        </div>
        <div class="c_box-f c_t_blue" id="paymentpricearea" hidden>
            <div class="c_L-step">Finalize</div>
            <div id="paymentpricebox">
                <p>Unit Price: <a class="j_i-cy"></a><a class="j_i-pc-payment" id="j_i-pc-decunit">**Error**</a><br></p>
                <div class="exchangecurrencyarea" id="decexchangecurrencyarea" hidden>
                    <p>Total Package Price: <a class="j_i-cy"></a><a class="j_i-pc-payment" id="j_i-pc-preferredcurrency">**Error**</a><br>
                    Exchange Rate: <a class="j_i-pc-payment" id="j_i-exc-dec">**Error**</a><br></p>
                    <label><input type="checkbox" id="decconsentbox" name="consent"> I understand that by pressing "Create Package", I accept the exchange rate listed above and understand that this transaction cannot be reversed for a full refund - the reverse exchange rate may be different.</label>
                </div>
                <div class="c_hline"><p>Final Price: <a class="j_i-pc-payment finalpaymentpriceindic">**Error**</a></p></div>
            </div><br>
            If you press "Create Package," <a class="j_i-pc-payment finalpaymentpriceindic">**Error**</a> will be deducted from your account balance. You may cancel the package in your shipments page at any time before you deliver it to our warehouse.<br><br>
            <button class="c_button" id="finaldeccreatebutton">Create Package</button>
            <a class="c_L-err" id="balanceerrorlabel" hidden><br>You do not have enough balance in your account to make this package.</a>
        </div>
    </div>
</div>