<div id="c_notif" hidden><a id="j_i-notif"><?php if($this->success) echo 'Box tracking number #' . $this->success . ' succesfully packed.' ?></a><button>X</button></div>
<div class="c_title">
    <button class="c_button c_t_blue j_link" data-url="manageshipments">Back to Manage Shipments</button>
    Box Package
</div>
<div class="c_box-c">
    <div id="tracknumarea">Tracking Number: <a id="tracknumindic"><?= $this->tracknum ?></a></div><br>
    <b>Package Created: <a><?= $this->createTime ?></a></b><br>
    <b>Set Status Time</b><br>
    <input id=""><br><br>
    <b>Please scan all the items in the package, then mark the package as boxed.</b>
    <div class="flexpkcontentsarea">
    <?php foreach($this->packageContents as $item): ?>
        <div class="c_box-bl">
            <b>Package Item</b><br>
            <b style="font-size: 36px">Item ID: <a class="fgidindic"><?= $item['ForecastsGoodsID'] ?: 'N/A' ?></a></b>
            <table class="c_table-idet"><tr style="font-size: 24px">
                <td>Quantity: </td><td><?= $item['Qty'] ?: 'N/A' ?></td></tr><tr>
                <td>Root Category: </td><td><?= $item['RootCategory'] ?: 'N/A' ?></td></tr><tr>
                <td>Subcategory: </td><td><?= $item['SubCategory'] ?: 'N/A' ?></td></tr><tr>
                <td>Name: </td><td><?= $item['ItemName'] ?: 'N/A' ?></td></tr><tr>
                <td>Brand: </td><td><?= $item['Brand'] ?: 'N/A' ?></td></tr><tr>
                <td>Color: </td><td><?= $item['Color'] ?: 'N/A' ?></td></tr><tr>
                <td>Style Code: </td><td><?= $item['StyleNo'] ?: 'N/A' ?></td></tr><tr>
                <td>UPC: </td><td><?= $item['UPC'] ?: 'N/A' ?></td></tr><tr>
                <td>SKU: </td><td><?= $item['SKU'] ?: 'N/A' ?></td></tr><tr>
                <td>Size: </td><td><?= $item['Size'] ?: 'N/A' ?></td></tr><tr>
                <td>Specification: </td><td><?= $item['Specification'] ?: 'N/A' ?></td></tr><tr>
                <td>Materials: </td><td><?= $item['Materials'] ?: 'N/A' ?></td></tr><tr>
                <td>Unit Price: </td><td><?= $item['UnitPrice'] ?: 'N/A' ?></td></tr>
            </table>
            <form>
                <input class="c_input-n fgidinput" placeholder="Scan barcode..."><button class="c_button scanfgidbutton">Scan</button><br>
            </form>
            <div style="float:right; height:20px">
                <a class="fgiderrorlabel c_L-err" hidden>Barcode does not match forecast goods ID.</a>
            </div>
        </div>
    <?php endforeach; ?>
    </div>
    <input type="checkbox" id="continueBox" checked> Continue to Next Box<br>
    <button class="c_button c_t_green" id="finalizeBoxbutton">Mark Boxed</button><br>
    <div class="j_load" hidden><div></div></div>
</div>