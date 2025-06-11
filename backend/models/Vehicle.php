<?php
class Vehicle {
    private $conn;
    private $table_name = "vehicles";

    public $id;
    public $plate;
    public $brand;
    public $model;
    public $year;
    public $status;
    public $current_mileage;
    public $next_service_date;
    public $next_service_mileage;
    public $next_verification_date;
    public $photo_url;
    public $serial_number;
    public $engine_number;
    public $color;
    public $insurance_policy;
    public $insurance_expiry_date;
    public $circulation_card;
    public $notes;
    public $last_updated;
    public $acquisition_date;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY plate ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->plate = $row['plate'];
            $this->brand = $row['brand'];
            $this->model = $row['model'];
            $this->year = $row['year'];
            $this->status = $row['status'];
            $this->current_mileage = $row['current_mileage'];
            $this->next_service_date = $row['next_service_date'];
            $this->next_service_mileage = $row['next_service_mileage'];
            $this->next_verification_date = $row['next_verification_date'];
            $this->photo_url = $row['photo_url'];
            $this->serial_number = $row['serial_number'];
            $this->engine_number = $row['engine_number'];
            $this->color = $row['color'];
            $this->insurance_policy = $row['insurance_policy'];
            $this->insurance_expiry_date = $row['insurance_expiry_date'];
            $this->circulation_card = $row['circulation_card'];
            $this->notes = $row['notes'];
            $this->last_updated = $row['last_updated'];
            $this->acquisition_date = $row['acquisition_date'];
            return true;
        }
        
        return false;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    id=:id,
                    plate=:plate,
                    brand=:brand,
                    model=:model,
                    year=:year,
                    status=:status,
                    current_mileage=:current_mileage,
                    next_service_date=:next_service_date,
                    next_service_mileage=:next_service_mileage,
                    next_verification_date=:next_verification_date,
                    photo_url=:photo_url,
                    serial_number=:serial_number,
                    engine_number=:engine_number,
                    color=:color,
                    insurance_policy=:insurance_policy,
                    insurance_expiry_date=:insurance_expiry_date,
                    circulation_card=:circulation_card,
                    notes=:notes,
                    last_updated=:last_updated,
                    acquisition_date=:acquisition_date";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->plate = htmlspecialchars(strip_tags($this->plate));
        $this->brand = htmlspecialchars(strip_tags($this->brand));
        $this->model = htmlspecialchars(strip_tags($this->model));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":plate", $this->plate);
        $stmt->bindParam(":brand", $this->brand);
        $stmt->bindParam(":model", $this->model);
        $stmt->bindParam(":year", $this->year);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":current_mileage", $this->current_mileage);
        $stmt->bindParam(":next_service_date", $this->next_service_date);
        $stmt->bindParam(":next_service_mileage", $this->next_service_mileage);
        $stmt->bindParam(":next_verification_date", $this->next_verification_date);
        $stmt->bindParam(":photo_url", $this->photo_url);
        $stmt->bindParam(":serial_number", $this->serial_number);
        $stmt->bindParam(":engine_number", $this->engine_number);
        $stmt->bindParam(":color", $this->color);
        $stmt->bindParam(":insurance_policy", $this->insurance_policy);
        $stmt->bindParam(":insurance_expiry_date", $this->insurance_expiry_date);
        $stmt->bindParam(":circulation_card", $this->circulation_card);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":last_updated", $this->last_updated);
        $stmt->bindParam(":acquisition_date", $this->acquisition_date);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    plate=:plate,
                    brand=:brand,
                    model=:model,
                    year=:year,
                    status=:status,
                    current_mileage=:current_mileage,
                    next_service_date=:next_service_date,
                    next_service_mileage=:next_service_mileage,
                    next_verification_date=:next_verification_date,
                    photo_url=:photo_url,
                    serial_number=:serial_number,
                    engine_number=:engine_number,
                    color=:color,
                    insurance_policy=:insurance_policy,
                    insurance_expiry_date=:insurance_expiry_date,
                    circulation_card=:circulation_card,
                    notes=:notes,
                    last_updated=:last_updated,
                    acquisition_date=:acquisition_date
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->plate = htmlspecialchars(strip_tags($this->plate));
        $this->brand = htmlspecialchars(strip_tags($this->brand));
        $this->model = htmlspecialchars(strip_tags($this->model));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":plate", $this->plate);
        $stmt->bindParam(":brand", $this->brand);
        $stmt->bindParam(":model", $this->model);
        $stmt->bindParam(":year", $this->year);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":current_mileage", $this->current_mileage);
        $stmt->bindParam(":next_service_date", $this->next_service_date);
        $stmt->bindParam(":next_service_mileage", $this->next_service_mileage);
        $stmt->bindParam(":next_verification_date", $this->next_verification_date);
        $stmt->bindParam(":photo_url", $this->photo_url);
        $stmt->bindParam(":serial_number", $this->serial_number);
        $stmt->bindParam(":engine_number", $this->engine_number);
        $stmt->bindParam(":color", $this->color);
        $stmt->bindParam(":insurance_policy", $this->insurance_policy);
        $stmt->bindParam(":insurance_expiry_date", $this->insurance_expiry_date);
        $stmt->bindParam(":circulation_card", $this->circulation_card);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":last_updated", $this->last_updated);
        $stmt->bindParam(":acquisition_date", $this->acquisition_date);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>