<div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
<div class="c_title">
    <button class="c_button c_t_blue" id="j_nav">>></button>
    <!--<button class="c_button c_t_yellow" id="uploadstatusbutton">Upload Status Updates</button>-->
    StarExpress Manager
</div>
<?php require $this->vUrl . 'manager/menu.php' ?>
<div class="c_content" id="c_content">
    <div class="c_box-c" id="j_t-top">
        <div class="c_tab c_t_red">
            <b>Forecasts</b>
        </div>
        <div class="c_box c_t_red">
            <form id="j_t-search"></form>
        </div>
    </div>
    <div id="c_subtitle" hidden>
        <button class="c_button" id="j_t-back">&lt;-- Go Back</button>
        <a id="sign_titlediv_function" hidden>
            Sign Forecasts<br>
        </a>
        <a id="delete_titlediv_function" hidden>
            Are you sure you want to delete the following forecasts?<br>
        </a>
    </div>
    <?php $this->pageBar = ['t' => 'red', 'perPage' => true];
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
        <button type="button" class="c_button" id="sign_submit_function" hidden>Sign Forecasts</button>
        <button type="button" class="c_button" id="delete_submit_function" hidden>Confirm Delete</button>
    </form>

    <div class="c_t_red t_menu" hidden>
        <table>
            <tr>
                <th colspan="3">Forecasts Menu</th>
            </tr>
            <tr>
                <td><button id="signforecastbutton">Sign</button></td>
                <td><button id="handlebutton">Handle</button></td>
                <td><button id="viewpackagebutton">View Packages</button></td>
                <td><button id="deleteforecastbutton">Delete</button></td>
            </tr>
        </table>
    </div>
</div>

<div id="c_overlay" class="c_t_green" hidden>
    <div id="c_overlay-box">
        <div cellspacing="0" class="pkgcontentbox" id="z_pkgcontentbox" hidden>
            <div class="c_box-bgt g_addPackageHeading">Loading...</div>
        </div>
        <?php $this->productSettings = ['heading' => 'Edit Forecast Item', 'addbutton' => 'Confirm Changes', 'clearbutton' => 'Discard Changes']; 
        require $this->vUrl . 'product.php'; ?>
    </div>
</div>