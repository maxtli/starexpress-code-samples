<?php
require '/home1/thestar/thestarexpress/libs/config.php';
require URL .'libs/helper/submit.php';

$log = fopen("getDeliveryStatus_log.txt", "a");
fwrite($log, "Get Delivery Status Task Started. " . date("Y-m-d h:i:sa")."  \r\n");

$inputData = ['keywords' => "tst0480715"];
$webSite = "https://www.tstexp.com/index.php?c=search&f=show";

fwrite($log, "\r\nAttempting to retrieve data for tracking number "
        . "tst0480715" . " from site " . "https://www.tstexp.com/ " . "...."."\r\n");
        
$result = submit($inputData, $webSite);

echo $result;

?>