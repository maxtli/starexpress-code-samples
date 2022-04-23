<?php

class View {
    
    public function render($viewFiles, $fullPage = true, $footer = true) {
        $this->_fullPage = $fullPage;
        $this->vUrl =  URL . Session::get('lang', true) . '/views/';
        if($fullPage)
            require $this->vUrl . "header.php";
        if(is_array($viewFiles))
            foreach ($viewFiles as $file) 
                require $this->vUrl . $file;
        else
            require $this->vUrl . $viewFiles;
        if($fullPage && $footer)
            require $this->vUrl . "footer.php";  
        exit;
    }
}