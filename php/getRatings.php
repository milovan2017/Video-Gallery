<?php
include('connection.php');

$resultObj=[];

$sql = "SELECT id, title, url, poster, rat_count, rat_sum, rat_avg FROM clips";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
       $resultObj[] = $row;
    }
} else {
    echo "0 results";
}

echo json_encode($resultObj);
