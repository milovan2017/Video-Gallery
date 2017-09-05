<?php
include('connection.php');

$data = $_POST['ratingData'];

$id = $data[0];
$rating = $data[1];
$sql = "UPDATE clips SET rat_sum = rat_sum + $rating, rat_count = rat_count + 1, rat_avg = rat_sum/rat_count WHERE id = '$id'";

if (mysqli_query($conn, $sql)) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);
