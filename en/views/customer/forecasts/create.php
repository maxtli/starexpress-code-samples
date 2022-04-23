<div id="c_overlay" class="c_t_blue" hidden>
    <div id="c_overlay-box">
        <div id="deleteitemarea">
            Are you sure you want to delete this item from your forecast?<br>
            <button class="c_button-bg c_t_red" id="yesdeletebutton">Yes, DELETE it</button>
            <button class="c_button-bg c_t_green" id="nodeletebutton">No, KEEP it</button>
        </div>
        <div id="warehousechangearea">
            Are you sure you want to change your warehouse? All packages and items already declared will be cleared.<br>
            <button class="c_button-bg c_t_blue" id="yeschangewarehousebutton">Yes, change warehouse</button>
            <button class="c_button-bg c_t_yellow" id="nochangewarehousebutton">No, keep warehouse</button>
        </div>
        <div id="z_pkgcontentbox">
            <div class="j_load"><div></div></div>
        </div>
    </div>
</div>
<div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
<div class="c_title">
    <button class="c_button c_t_red" id="j_nav">>></button>
    Create New Forecast
</div>
<?php require $this->vUrl . 'customer/menu.php' ?>
<div class="c_content crfccontent">
    <div class="c_box-c" id="c_box-main">
        <div>
            <div class="c_tab c_t_red">Fill Out Forecast Details</div>
        </div>
        <div class="c_box-f c_t_red">
            <table style="width: 100%; table-layout: fixed">
                <tbody id="j_dy-form"></tbody>
                <tr>
                    <td colspan="3">
                        <table cellspacing="0" class="pkgcontentbox c_t_blue" id="pkgcontentbox">
                            <tr><th colspan="6" class="c_box-bgt" id="g_addPackageHeading">Add Packages to Forecast</th></tr>
                            <tr><td class="c_L-bold">Packages in Forecast</td></tr>
                            <tr class="c_row-ipt">
                                <td>
                                    <div class="c_input" id="showpkgtextarea" style="width: 70%" disabled>None</div>
                                </td>
                            </tr>
                            <tr class="c_row-ipt"><td><button class="c_button" id="selectpkgbutton">Select Packages...</button></td></tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <?php $this->productSettings = ['heading' => 'Add Items to Forecast', 'addbutton' => 'Add Item',
                            'clearbutton' => 'Clear', 'color' => 'green', 'postval' => true];
                        require $this->vUrl . 'product.php';
                        ?>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="padding-top: 20px">
                        <input type="submit" class="c_button" value="Create Forecast" id="finalcreatebutton" disabled>
                        <a class="c_L-err" id="createerrorlabel" hidden><br>There were errors in your form submission. Please scroll up to fix them.</a>
                        <form id="submitforecastform"></form>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</div>