<?php if ($this->_fullPage) : ?>
    <div id="c_notif" hidden><a id="j_i-notif"></a><button>X</button></div>
    <div class="c_title">
        <button class="c_button c_t_green" id="j_nav">>></button>
        <button class="c_button c_t_green" id="viewinvhistorybutton">
            View My Inventory History
        </button>
        <a id="contentheading">My Current Inventory</a>
    </div>
    <?php require $this->vUrl . 'customer/menu.php' ?>
    <div class="c_content">
        <div class="c_box-c" id="j_t-top" hidden>
        <?php else : ?>
            <div class="c_title" id="pkiv_c_title" style="margin-top: 0;">
                <button class="c_button c_t_red predicatebutton" id="discardchangesbutton" disabled>Discard Changes</button>
                <button class="c_button c_t_green predicatebutton" id="confirmchangesbutton" disabled>Save Changes</button>
                Add Inventory Items to Package
            </div>
            <div class="c_content">
                <div class="c_L-opc c_t_yellow">Items Currently In Package</div>
                <table class="c_table c_t_yellow" id="pkivtable" cellspacing="0" cellpadding="0">
                    <tbody class="c_table-head">
                        <tr>
                            <td><button class="c_button-ir c_t_red" id="removepkivbutton" disabled>Remove selected</button>
                            </td>
                            <td>Qty</td>
                            <td>UPC/SKU</td>
                            <td>Category</td>
                            <td>Brand</td>
                            <td>Name</td>
                            <td>Price</td>
                            <td>
                                <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                                <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="c_L-opc c_t_green">All Inventory Items in <a class="Warehouseindic"></a></div>
                <div class="c_box-c" id="j_t-top" hidden>
                <?php endif; ?>
                <div class="c_tab c_t_green">
                    <b>Inventory Search:</b>
                </div>
                <div class="c_box c_t_green">
                    <form id="j_t-search"></form>
                </div>
                </div>
                <?php $this->pageBar = ['t' => 'green', 'export' => $this->_fullPage ? 'inventory' : false, 'toggle' => 'blue'];
                require $this->vUrl . 't-pageBar.php' ?>

            <form id="inventoryoperationform" method="post">
                <table class="c_table c_t_green searchresulttable" id="geninvtable" cellspacing="0" cellpadding="0" hidden>
                    <tbody class="c_table-head">
                        <tr>
                            <td><input type='checkbox' id='selectAllBox'></td>
                            <td>Qty</td>
                            <td>UPC/SKU</td>
                            <td>Category</td>
                            <td>Brand</td>
                            <td>Name</td>
                            <td>Price</td>
                            <?php if ($this->_fullPage) : ?>
                                <td>Warehouse</td>
                            <?php endif; ?>
                            <td>
                                <button type="button" class="c_button-ic" id="j_t-expand-A"><img src="<?= ASSETS ?>images/expand.png" alt="expand"></button>
                                <button type="button" class="c_button-ic" id="j_t-collapse-A" hidden><img src="<?= ASSETS ?>images/collapse.png" alt="collapse"></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
        <?php if ($this->_fullPage) : ?>
            <div class="c_t_green t_menu" hidden>
                <table>
                    <tr>
                        <th>Inventory Menu</th>
                    </tr>
                    <tr>
                        <td><button id="viewhistorybutton">View History</button></td>
                    </tr>
                </table>
            </div>

            <div id="invhistoryarea" style="padding-top: 20px" class="c_t_yellow" hidden>
                <div class="c_L-disclaimer">Inventory history shown for past three months. To view transactions older than
                    three months, please <a href='/contacts'>contact us</a>.</div>
                <div id="specifichistoryarea" hidden>
                    <b>Showing history for item UPC/SKU #<a id="upcskuindic"></a>.</b><br>
                    <button class="c_button" id="viewallhistorybutton">View History For All Items</button>
                </div>
                <table class="c_table-fx" style="width:90%">
                    <tbody class="c_table-head">
                        <tr>
                            <td>Time</td>
                            <td>Warehouse</td>
                            <td>Transaction</td>
                            <td>UPC/SKU</td>
                            <td>Category</td>
                            <td>Brand</td>
                            <td>Item</td>
                            <td>Qty</td>
                            <td colspan="2">From/To</td>
                        </tr>
                    </tbody>
                    <?php foreach ($this->history as $transaction) : $mode = ($transaction['TransactionType'] === 'Deposit'); ?>
                        <tr class="c_t_<?= $mode ? 'red' : 'blue' ?>" data-pid="<?php echo $transaction['ProductID']; ?>">
                            <td>
                                <?= $transaction['TransactionTime'] ?>
                            </td>
                            <td>
                                <?= $transaction['Warehouse'] ?>
                            </td>
                            <td>
                                <?= $transaction['TransactionType'] ?>
                            </td>
                            <td>
                                <?= $transaction['UPC'] ?>
                            </td>
                            <td>
                                <?= $transaction['Category'] ?>
                            </td>
                            <td>
                                <?= $transaction['Brand'] ?>
                            </td>
                            <td>
                                <?= $transaction['Item'] ?>
                            </td>
                            <td>
                                <?= ($mode ? '+' : '-') . $transaction['Amount'] ?>
                            </td>
                            <td>
                                <?= $mode ? 'Forecast #<a class="idindic">' . $transaction['ForecastsID'] : '<a class="idindic">' . $transaction['TrackingNumber'] ?></a>
                            </td>
                            <td><button class="c_button-ir  j_link" data-url="<?= $mode ? 'forecasts/find/' . $transaction['ForecastsID'] : 'shipments/find/' . $transaction['TrackingNumber'] ?>">View</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </table>
            </div>
        <?php else : ?>
            <div class="c_t_green t_menu" style="width:500px" hidden>
                <table>
                    <td>
                        <button id="addpkivbutton">Add Selected Item(s) to Package</button>
                    </td>
                </table>
            </div>
            <script>
                $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/customer/inventory/index.js");
                $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/table.js", function() {
                    $.getScript("<?php echo ASSETS . Session::get('lang', true); ?>/js/customer/inventory/opc.js");
                });
            </script>
        <?php endif; ?>