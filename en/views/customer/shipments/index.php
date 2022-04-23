<?php if($this->_fullPage): ?>
<div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
<script>
$(function() {
    <?php if($this->preset) {
        switch($this->preset) {
            case 'fcid': 
                $notif = 'Packages found for forecast #' . $this->num; 
                $field = "fcid"; 
                break;
            case 'crpk': 
                $notif = 'Package successfully created. Tracking number: #' . $this->num; 
                $field = "TrackingNumber";
                break;
            case 'find': 
                $notif = 'Showing result for package #' . $this->num . '.'; 
                $field = "TrackingNumber";
                break;
        }
        echo "showNotif('" . $notif . "'); refreshTable('search', {'" . $field . "' : '" . $this->num . "', 'Status' : 'All'});";
    } else echo "refreshTable('search', {'search': 'all'});";
    ?>
});
</script>
<div class="c_title">
    <button class="c_button c_t_yellow" id="j_nav">>></button>
    <button class="c_button j_link" data-url="shipments/create">+ New Shipment</button>
    My Shipments
</div>
<?php require $this->vUrl . 'customer/menu.php' ?>
<div class="c_content">
    <div class="c_box-c" id="j_t-top">
<?php else: ?>
<div class="c_title" style="margin-top: 0px;">
    <button class="c_button c_t_red predicatebutton" id="discardchangesbutton" disabled>Discard Changes</button>
    <button class="c_button c_t_green predicatebutton" id="confirmchangesbutton" disabled>Save Changes</button>
    Add/Edit Packages in Forecast
</div>
<div class="c_content" style="width: 100%">
    <div class="c_L-opc c_t_yellow">Packages Currently in Forecast</div>
    <table class="c_table c_t_yellow" id="fcpktable" cellspacing="0" cellpadding="0">
        <tbody class="c_table-head">
                <td><button class="c_button-ir c_t_red" id="removefcpkbutton" disabled>Remove selected</button></td>
                <td>Tracking#</td>
                <td>Status</td>
                <td style="width: 5%">ID</td>
                <td>Service</td>
                <td>Warehouse</td>
                <td>Weight</td>
                <td>Volume</td>
                <td>Price</td>
                <td>
                    <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                    <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                </td>
        </tbody>
        <?php foreach ($this->fcpk as $key => $package): ?>
        <tbody class="t_Qrow" data-tn="<?php echo $key; ?>">
            <tr>
                <td rowspan="2"><input type="checkbox" class="selectbox"></td>
                <td class="tracknumcell"><a class="trackingnum"><?php echo $package['TrackingNumber']; ?></a></td>
                <td class="pkstatuscell"><?php echo $package['Status']; ?></td>
                <td><?php echo $package['IDStatus']; ?></td><!---->
                <td id="Servicelabel"><?php echo $package['Service']; ?></td>
                <td id="Warehouselabel"><?php echo $package['Warehouse']; ?></td>
                <td class="weightcell" id="Weightlabel"><?php echo $package['DeclaredWeight']; ?></td>
                <td class="volumecell" id="Volumelabel"><?php echo $package['DeclaredVolume'] ?: 'N/A'; ?></td>
                <td><?php echo $package['Price']; ?></td>
                <td>
                    <button type="button" class="c_button-ic j_t-expand"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                    <button type="button" class="c_button-ic j_t-collapse"><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                </td>
            </tr>
            <tr hidden>
                <td class="t_ic-wrapper" colspan="8">
                    <table class="c_table-s">
                            <td><b>Created: </b><?php echo $package['CreateTime']; ?></td>
                            <td class="RecipientName_editcell"><b>Recipient Name: </b><a class="RecipientName_label"><?php echo $package['Recipient']; ?></a></td>
                            <td class="RecipientAddress_editcell" colspan="3"><b>Recipient Address: </b><a class='Country_label'><?php echo $package['Country']; ?></a> <a class='State_label'><?php echo $package['State']; ?></a> <a class='City_label'><?php echo $package['City']; ?></a> <a class='Address_label'><?php echo $package['Address']; ?></a> <a class='Zip_label'><?php echo $package['Zip'] ?: ''; ?></td>
                    </table>
                </td>
            </tr>
        </tbody>
        <?php endforeach; ?>
    </table>
    <div class="c_L-opc c_t_blue">All Declared Packages</div>
    <div class="c_box-c" id="j_t-top" hidden>
<?php endif; ?>
        <div class="c_tab c_t_blue" id="shipmentsearchlabel">
            <b>Shipment Search:</b>
        </div>
        <div class="c_box c_t_blue">
            <form id="j_t-search"></form>
        </div>
    </div>
    <?php if($this->_fullPage): ?>
    <div id="c_subtitle" hidden>
        <button class="c_button" id="j_t-back">&lt;-- Go Back</button>
        <a id="edit_titlediv_function" hidden>
            Edit<br>
        </a>
        <a id="delete_titlediv_function" hidden>
            Delete<br>
        </a>
        <div id="unbox_titlediv_function" hidden>
            Unbox packages?<br>
            <a style="font-size: 14px">Items inside this package will be restored to the inventory.</a>
        </div>
    </div>
    <?php endif; ?>
    <input type="file" id="importtracknuminput" name="numlist" accept=".csv" disabled hidden>
    <?php $this->pageBar = ['t' => 'blue', 'export' => $this->_fullPage ? 'shipments' : false, 'toggle' => $this->_fullPage ? false : 'yellow'];
                require $this->vUrl . 't-pageBar.php' ?>
    <form id="shipmentoperationform" method="post">
        <table class="c_table c_t_blue searchresulttable" id="genpkgtable" cellspacing="0" cellpadding="0" hidden>
            <tbody class="c_table-head">
                <tr>
                    <td><input type='checkbox' id='selectAllBox'></td>
                    <td>Tracking#</td>
                    <td>Status</td>
                    <td style="width: 5%">ID</td>
                    <td id="ServicelabelII">Service</td>
                    <td id="WarehouselabelII">Warehouse</td>
                    <td id="changeAllWeightCell">Weight</td>
                    <td id="changeAllVolumeCell">Volume</td>
                    <td>Price</td>
                    <td>
                        <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                        <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php if($this->_fullPage): ?>
        <a id="editerrorlabel" class="c_L-err" hidden>You have made no changes to one or more of the listed packages and/or fields.<br> 
            Press Go Back and select only the packages you wish to edit if you do not intend to change the package details, or press the trash can next to fields you do not wish to change.<br></a>
        <div class="c_box c_box-c c_t_yellow" id="pkrefundarea" hidden>
            <b>Package Refund</b><br>
            If you delete these packages, you will receive a full refund of the package price in its listed currency. If you exchanged currencies before/during your package order and wish to re-exchange your account balance to your original currency, you must do that manually by clicking "Exchange Currencies" in your account page. The reverse exchange rate may be different from the one used initially.
            <div class="c_hline">You will receive: </div>
            <div class="c_L-bal" id="refundpkgindic"></div>
        </div>
        <button type="button" class="c_button" id="edit_submit_function" hidden>Confirm Changes</button>
        <button type="button" class="c_button" id="delete_submit_function" hidden>Confirm Delete</button>
        <button type="button" class="c_button" id="unbox_submit_function" hidden>Confirm Unbox</button>
        <?php endif; ?>
    </form>
</div>
<?php if($this->_fullPage): ?>
<div class="c_t_yellow t_menu" hidden>
    <table>
        <tr>
            <th colspan="4">Shipments Menu</th>
        </tr>
        <tr>
            <td><button id="editpackagebutton">Edit</button></td>
            <td><button id="viewstatusbutton">View Details</button></td>
            <td><button id="deletepackagebutton">Delete</button></td>
            <td><button id="unboxpackagebutton">Unbox</button></td>
        </tr>
    </table>
</div>
<?php else: ?>
<div class="c_t_yellow t_menu" hidden>
    <table><td>
        <button id="addfcpkbutton">Add Selected Package(s) to Forecast</button>
    </td></table>
</div>
<script>
    _OPC = "#c_overlay-box "; 
    if(typeof loadOPC === 'function')
        loadOPC();
    else {
        $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/customer/shipments/index.js");
        if (typeof loadTable === 'function')
            $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/customer/shipments/opc.js");
        else {
            $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/table.js", function() {$.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/customer/shipments/opc.js");});
        }
    } 
</script>
<?php endif; ?>