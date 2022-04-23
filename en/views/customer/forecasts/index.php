<div id="c_overlay" class="c_t_green" hidden>
    <div id="c_overlay-box">
        <div cellspacing="0" class="pkgcontentbox" id="z_pkgcontentbox" hidden>
            <div class="j_load"><div></div></div>
        </div>
        <?php $this->productSettings = ['heading' => 'Edit Forecast Item', 'addbutton' => 'Confirm Changes', 'clearbutton' => 'Discard Changes']; 
        require $this->vUrl . 'product.php'; ?>
    </div>
</div>
<div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
<script>
$(function() {
    <?php if($this->preset) {
        switch($this->preset) {
            case 'crfc': 
                $notif = 'Forecast successfully created. Forecast ID: ' . $this->num; 
                break;
            case 'find': 
                $notif = 'Forecast #' . $this->num . ' found.'; 
                break;
        }
        echo "$('#j_i-notif').html('" . $notif . "'); refreshTable('search', {'fcid' : '" . $this->num . "', 'status' : 'All'});";
    } else echo "refreshTable('search', {'search': 'all'});"
    ?>
});
</script>
<div class="c_title">
    <button class="c_button c_t_red" id="j_nav">>></button>
    <button class="c_button c_t_red j_link" data-url="forecasts/create">
        + Create New Forecast
    </button>
    My Forecasts
</div>
<?php require $this->vUrl . 'customer/menu.php' ?>
<div class="c_content">
    <div class="c_box-c" id="j_t-top">
        <div class="c_tab c_t_red">
            <b>Forecast Search:</b>
        </div>
        <div class="c_box c_t_red">
            <form id="j_t-search"></form>
        </div>
    </div>
    <div id="c_subtitle" hidden>
        <button class="c_button" id="j_t-back">&lt;-- Go Back</button>
        <a id="edit_titlediv_function" hidden>
            Edit<br>
        </a>
        <a id="delete_titlediv_function" hidden>
            Are you sure you want to delete the following forecasts?<br>
        </a>
    </div>
    <?php $this->pageBar = ['t' => 'red', 'export' => 'forecasts'];
        require $this->vUrl . 't-pageBar.php' ?>
    <form id="forecastoperationform" method="post">
        <table class="c_table c_t_red searchresulttable" cellspacing="0" cellpadding="0" hidden>
            <tbody class="c_table-head">
                <tr>
                    <td><input type='checkbox' id='selectAllBox'></td>
                    <td>Create Time</td>
                    <td>Warehouse</td>
                    <td>Transporter</td>
                    <td>Tracking#</td>
                    <td>Status</td>
                    <td>Sign Time</td>
                    <td id="changeAllWeightCell">Weight</td>
                    <td id="changeAllVolumeCell">Volume</td>
                    <td>
                        <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                        <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                    </td>
                </tr>
            </tbody>
        </table>
        <a id="editerrorlabel" class="c_L-err" hidden>You have made no changes to the forecast.<br></a>
        <button type="button" class="c_button" id="edit_submit_function" hidden>Confirm Changes</button>
        <button type="button" class="c_button" id="delete_submit_function" hidden>Confirm Delete</button>
    </form>

    <div class="c_t_red t_menu" hidden>
        <table>
            <tr>
                <th colspan="3">Forecasts Menu</th>
            </tr>
            <tr>
                <td><button id="editforecastbutton">Edit</button></td>
                <td><button id="viewpackagebutton">View Packages</button></td>
                <td><button id="deleteforecastbutton">Delete</button></td>
            </tr>
        </table>
    </div>
</div>