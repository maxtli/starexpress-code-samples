<?php // options: t - theme color, export - export link, toggle - show/hide search, perpage - select page count, noselect - no selected ?>
<div class="c_L-disclaimer" id="j_t-noResults" hidden><?= $this->pageBar['text'] ?: 'No results found. Please refine your search and try again.' ?></div>
<div id="t_pageBar" class="c_t_<?= $this->pageBar['t'] ?>"hidden>
    <div>
        <div class="c_box-ct"><b>Total</b>: <a id="totalcountindicator"></a><?= $this->pageBar['noselect'] ? '' : ' <b>Selected</b>: <a id="selectedcountindicator">0</a>' ?></div>
        <?php if ($this->pageBar['export']) : ?>
            <button type="button" class="c_button j_link" data-url="<?= $this->pageBar['export'] ?>/export" id="j_t-export">Export All</button>
        <?php endif; if ($this->pageBar['toggle']) : ?>
            <button type="button" class="c_button c_t_<?= $this->pageBar['toggle'] ?>" id="j_toggleSearch">Show Search</button>
        <?php endif; ?>
    </div>
    <div>
        <div class="t_pageFlip">
            <button type="button" class="c_button-s" id="j_t-prev" hidden><<</button>
            <b>Page <a id="pageindicator">1</a> of <a id="maxpageindicator"></a></b>
            <button type="button" class="c_button-s" id="j_t-next">>></button>
        </div>
        <?php if($this->pageBar['perPage']): ?>
            <div>Per page: <select class="c_input-n" id="j_t-perPage"><option>25</option><option>50</option><option>100</option></select></div>
        <?php endif; ?>
        <div>
            Go to page:
            <select class="c_input-n" id="j_t-page"></select>
        </div>
    </div>
</div>
<div class="j_load" hidden>
    <div></div>
</div>