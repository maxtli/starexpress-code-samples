<div id="c_notif" hidden><a id="j_i-notif"><?php 
if ($_GET['notif']) 
    switch($_GET['notif']) {
        case 'success': echo 'ID verified successfully.'; break;
        case 'invalid': echo 'ID marked invalid successfully.'; break;
        case 'back': echo 'ID status was not altered.'; break;
        case 'expired': echo 'Oops! Your session expired or you refreshed the page. Please try again.'; break;
        case 'error': echo 'An internal error occurred. ID status was not altered.'; break;
    } ?></a><button>X</button></div>
<div class="c_title">
    <button class="c_button c_t_blue" id="j_nav">>></button>
    <!--<button class="c_button c_t_yellow" id="uploadstatusbutton">Upload Status Updates</button>-->
    StarExpress Manager
</div>
<?php require $this->vUrl . 'manager/menu.php' ?>
<div class="c_content" id="c_content">
    <div class="c_box-c" id="j_t-top">
        <div class="c_tab c_t_blue" id="shipmentsearchlabel">
            <b>Shipments</b>
        </div>
<!--<form id="importstatusupdatesform" action="/managestatus/upload" method="post" enctype="multipart/form-data" hidden><input type="file" id="importstatusupdatesinput" name="html" accept=".txt, .html"></form>-->
<div class="c_box c_t_blue">
    <form id="j_t-search"></form>
</div>
</div>
<div id="c_subtitle" hidden>
    <button class="c_button" id="j_t-back">&lt;-- Go Back</button>
    <div id="sign_titlediv_function" hidden>
        Sign Packages<br>
        <a style="font-size: 16px; color: red;">Please fill in each package's weight (required) and volume (optional) to continue.</a>
    </div>
    <div id="edit_titlediv_function" hidden>
        Edit<br>
    </div>
    <div id="send_titlediv_function" hidden>
        Send Packages<br>
        <a style="font-size: 16px; color: red;">Please fill in each package's carrier and tracking number to continue.</a>
    </div>
    <div id="updatestatus_titlediv_function" hidden>
        Add Package Statuses<br>
    </div>
    <div id="sendmessage_titlediv_function" hidden>
        Send Message<br>
    </div>
    <div id="delete_titlediv_function" hidden>
        Are you sure you want to delete the following packages?<br>
    </div>
</div>
<input type="file" id="importtracknuminput" name="numlist" accept=".csv" disabled hidden>
<input type="file" id="sendnumfileinput" name="sendnumfile" accept=".csv" disabled hidden>
<input type="file" id="transfernumfileinput" name="importtransfernumfile" accept=".csv" disabled hidden>
<?php $this->pageBar = ['t' => 'blue', 'export' => 'manageshipments', 'perPage' => true];
                require $this->vUrl . 't-pageBar.php' ?>
<form id="shipmentoperationform" method="post">
    <div class="c_box-c j_t-opArea operationarea_sign operationarea_send c_t_blue" hidden>
        <a class="c_L-bold">Enter Time</a>
        <br>
        <input type="date" class="c_input-sl datetimeinput" id="customdateselector" name="customdate" value="<?php echo date('Y-m-d'); ?>" required disabled>
        <input type="time" class="c_input-sl datetimeinput" id="customtimeselector" name="customtime" value="<?php echo date('H:i'); ?>" required disabled>
        <br>
    </div>
    <div class="c_box-c j_t-opArea operationarea_updatestatus c_t_blue" hidden>
        <a class="c_L-bold">Select Status</a>
        <br>
        <select class="c_input-n" id="statusselector" name="packagestatus" disabled>
            <option value="">Select Status...</option>
            <?php
            $i = 1;
            foreach ($this->statusOptions as $option) {
                echo "<option value=" . $i . ">" . $option . "</option>";
                $i++;
            }
            ?>
            <option value="Transfer">国内配送。  转国内【____】，单号【_____】</option>
            <option>Custom</option>
        </select>
        <input class="c_input-n" id="statusentry" name="packagestatuscustom" placeholder="Separate status / activity with slash" hidden disabled>
        <br><br>
        <a class="c_L-bold locationselectorlabel">Enter Location</a>
        <br>
        <input class="c_input-n" id="locationselector" name="statuslocation" placeholder="Location..." required disabled>
        <br><br>
        <a class="c_L-bold">Enter Status Time</a>
        <br>
        <input type="date" class="c_input-sl datetimeinput" id="statusdateselector" name="statusdate" value="<?php echo date('Y-m-d'); ?>" required disabled>
        <input type="time" class="c_input-sl datetimeinput" id="statustimeselector" name="statustime" value="<?php echo date('H:i'); ?>" required disabled>
        <br><br>
        <div id="uploadtransfernumarea" hidden>
            <button type="button" class="c_button" id="exporttransfernumbutton">Export Form</button>
            <button type="button" class="c_button" id="importtransfernumbutton">Import Transfer Numbers</button>
        </div>
    </div>
    <div class="c_box-c j_t-opArea operationarea_sendmessage c_t_blue" hidden>
        <a class="c_L-bold">Select Message</a>
        <br>
        <select class="c_input-n" id="messageselector" name="messagemode" disabled>
            <option value="">Custom</option>
            <?php
            $i = 1;
            foreach ($this->messageOptions as $option) {
                echo "<option value=" . $i . ">" . $option . "</option>";
                $i++;
            }
            ?>
        </select>
        <br><br>
        <a class="c_L-bold">Type Message</a>
        <br>
        <textarea class="c_input-n" id="messageentry" name="messagecustom" rows="4" cols="40" placeholder="Type Message..." disabled required></textarea><br>
        <a>Use ## to designate the package tracking number, %% to designate a transfer transporter, and ### to designate a transfer tracking number.</a>
    </div>
    <table class="c_table c_t_blue searchresulttable" cellspacing="0" cellpadding="0" hidden>
        <tbody class="c_table-head">
            <tr>
                <td><input type='checkbox' id='selectAllBox'></td>
                <td>PKID</td> 
                <td>Tracking#</td>
                <td>Status</td>
                <td>ID</td>
                <td>Service</td>
                <td>Warehouse</td>
                <td id="changeAll_ActualWeightCell">Weight (lb)</td>
                <td id="changeAll_ActualVolumeCell">Volume (in^3)</td>
                <td class="send_removablecell updatestatus_removablecell" id="changeAll_TransporterCell" hidden>Carrier</td>
                <td class="send_removablecell" id="changeAll_ServiceCell" hidden>Service</td>
                <td class="send_removablecell updatestatus_removablecell" hidden>Carrier Tracking #</td>
                <td>
                    <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                    <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                </td>
            </tr>
        </tbody>
    </table>
    <a id="editerrorlabel" class="c_L-err" hidden>You have made no changes to one or more of the listed packages and/or fields.<br> 
        Press Go Back and select only the packages you wish to edit if you do not intend to change the package details, or press the trash can next to fields you do not wish to change.<br></a>
    <button type="button" class="c_button" id="sign_submit_function" hidden>Sign Packages</button>
    <button type="button" class="c_button" id="send_submit_function" hidden>Send Packages</button>
    <button type="button" class="c_button" id="edit_submit_function" hidden>Confirm Changes</button>
    <button type="button" class="c_button" id="importsend_submit_function" hidden>Upload Excel Tracking Numbers</button>
    <button type="button" class="c_button" id="updatestatus_submit_function" hidden>Update Statuses</button>
    <button type="button" class="c_button" id="sendmessage_submit_function" hidden>Send Message</button>
    <button type="button" class="c_button" id="delete_submit_function" hidden>Confirm Delete</button>
</form>
<div class="c_t_blue menu_shipments t_menu" hidden>
    <table>
        <tr>
            <th colspan="8">Shipments Menu</th>
        </tr>
        <tr>
            <td><button class="j_bmtOp" data-op="sign" id="bm_sign">Sign</button></td>
            <td><button class="j_bmtOp" data-op="edit" id="bm_edit">Edit</button></td>
            <td><button class="j_bmtOp" data-op="send" id="bm_send">Send</button></td>
            <td><button id="boxpkbutton">Box/Unbox</button></td>
            <td><button id="verifyidbutton">View ID</button></td>
            <td><button id="viewstatusbutton">View Status</button></td>
            <td><button class="j_bmtOp" data-op="updatestatus" id="bm_updatestatus">Update Status</button></td>
            <td><button class="j_bmtOp" data-op="sendmessage" id="bm_sendmessage">Send Msg</button></td>
            <td><button class="j_bmtOp" data-op="delete" id="bm_delete">Delete</button></td>
        </tr>
    </table>
</div>
</div>
<?php if($this->boxMode):?>
<script>
$(function() {
    refreshTable('search', {'status': '<?= $this->boxMode === 'box' ? 'Picking' : 'Boxed' ?>'}, 'GET', false, '% shipment(s) found that need to be boxed.');
});
</script>
<?php endif; ?>