<table cellspacing="0" class="pkgcontentbox<?php if ($this->productSettings['color']) echo ' c_t_' . $this->productSettings['color'] ?>" id="itemcontentbox">
    <tr><th colspan="7" class="c_box-bgt" id="g_addItemHeading"><?= $this->productSettings['heading'] ?></th></tr>
    <tr><td class="c_L-bold" colspan="7">Scan or Type UPC Barcode</td></tr>
    <tr class="c_row-ipt"><td colspan="7">
            <input class="c_input-n crpriteminput" placeholder='UPC...' id="crpritem_UPC" required>
            <button type="button" class="c_button-s" id="j_scanUpc">Search</button>
        </td></tr>
    <tr><td colspan="7"><b style="font-size:20px">~- OR -~</b></td></tr>
    <tr><td class="c_L-bold" colspan="7">Fill Out Item Details</td></tr><tr><td colspan="7">Please fill out all applicable fields. * indicates a <?php echo $this->productSettings['addbutton'] ? 'required' : 'suggested'; ?> field.</td></tr>
    <tr>
        <?php if($this->productSettings['addbutton']): ?>
        <td class="c_L-bold" style="width: 10%">
            Qty*
        </td>									
        <td class="c_L-bold">
        <?php else: ?>
        <td class="c_L-bold" colspan="2">
        <?php endif; ?>
            Root Category*
        </td>
        <td class="c_L-bold" colspan="2">
            Subcategory*
        </td>
        <?php if($this->productSettings['addbutton']): ?>
        <td class="c_L-bold">
            Brand
        </td>		
        <td class="c_L-bold" colspan="2">
            Value per Item*
        </td>
        <?php else: ?>
        <td class="c_L-bold" colspan="2">
            Brand
        </td>
        <?php endif; ?>
    </tr>
    <tr class="c_row-ipt">
        <?php if($this->productSettings['addbutton']): ?>
        <td>
            <input class="c_input crpriteminput" id="Qtybox" value="1" oninput="numberBoundCheck(this, {min: 1, limdec: 0})" style="text-align:center" required>
        </td>
        <td>
        <?php else: ?>
        <td colspan="2">
        <?php endif; ?>
            <select class="c_input crpriteminput" id="j_LX-RootCategory" required><option value="">Root Category...</option></select>
        </td>
        <td colspan="2">
            <select class="c_input crpriteminput" id="j-LX-Subcategory" required disabled><option value="">Subcategory...</option></select>
        </td>
        <?php if($this->productSettings['addbutton']): ?>
        <td>
            <input class="c_input crpriteminput" placeholder="Brand..." id="crpritem_Brand">
        </td>
        <td style="padding-right: 0">
            <div class="c_input j_i-cy c_t_green c_box-cy"></div>
        </td>
        <td style="padding-left: 0">
            <input class="c_input crpriteminput" step="0.01" placeholder='Unit Value...' oninput="numberBoundCheck(this)" id="crpritem_Price" required>
        </td>
        <?php else: ?>
        <td colspan="2">
            <input class="c_input crpriteminput" placeholder="Brand..." id="crpritem_Brand">
        </td>
        <?php endif; ?>
    </tr>
    <tr>
        <td colspan="3" class="c_L-bold">
            Item Name*
        </td>
        <td colspan="2" class="c_L-bold">
            Material
        </td>
        <td colspan="2" class="c_L-bold">
            Color
        </td>
    </tr>
    <tr class="c_row-ipt">
        <td colspan="3">
            <input class="c_input crpriteminput" placeholder='Item Name...' id="crpritem_Name" required>
        </td>
        <td colspan="2">
            <input class="c_input crpriteminput" placeholder='Materials...' id="crpritem_Materials">
        </td>
        <td colspan="2">
            <input class="c_input crpriteminput" placeholder='Color...' id="crpritem_Color">
        </td>									
    </tr>								
    <tr>
        <td class="c_L-bold" colspan="2">
            Style Code
        </td>
        <td class="c_L-bold">
            Size
        </td>
        <td class="c_L-bold" colspan="4">
            Specifications
        </td>
    </tr>
    <tr class="c_row-ipt">
        <td colspan="2">
            <input class="c_input crpriteminput" placeholder='Style Code...' id="crpritem_StyleNo">
        </td>
        <td>
            <input class="c_input crpriteminput" placeholder='Size...' id="crpritem_Size">
        </td>
        <td colspan="4">
            <input class="c_input crpriteminput" placeholder='Specifications...' id="crpritem_Specification">
        </td>	
    </tr>
    <?php if($this->productSettings['addbutton']): ?>
    <tr><td colspan="7">
            <button class="c_button-bsq c_t_green" id="g_addItemButton"><?= $this->productSettings['addbutton'] ?></button>
            <button class="c_button-bsq c_t_red" id="g_clearItemButton"><?= $this->productSettings['clearbutton'] ?></button>
        </td></tr>
    <?php endif; ?>
</table>
<?php if ($this->productSettings['postval']) :?>
<table cellspacing="0" class="pkgcontentbox" id="itembottomcontentbox">
    <tr><th class="c_L-bold" colspan="6">Added Items</th></tr>
    <tr>
        <td style="padding: 5px 20px"><table cellspacing="0" class="c_table-s c_center" id="addedItemsTable">
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
                    <td>
                    </td>
                </tr>
            </table></td>
    </tr>
    <tr>
        <td colspan="10" id="totalvaluecell">
            <div class="c_box-pr">Total Value: <a class="j_i-cy"></a><a id="j_i-pc-total">0.00</a></div>
        </td>
    </tr>
</table>
<?php endif; ?>