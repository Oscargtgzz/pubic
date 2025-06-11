<?php
class Catalog {
    private $conn;
    private $table_name;

    public $id;
    public $name;
    public $brand_id; // Para modelos
    public $manager_name; // Para talleres
    public $address; // Para talleres
    public $city; // Para talleres
    public $state; // Para talleres
    public $phone; // Para talleres
    public $email; // Para talleres

    public function __construct($db, $table_name) {
        $this->conn = $db;
        $this->table_name = $table_name;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readByBrand() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE brand_id = ? ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->brand_id);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        if ($this->table_name === 'models') {
            $query = "INSERT INTO " . $this->table_name . " SET id=:id, name=:name, brand_id=:brand_id";
        } elseif ($this->table_name === 'workshops') {
            $query = "INSERT INTO " . $this->table_name . " 
                     SET id=:id, name=:name, manager_name=:manager_name, address=:address, 
                         city=:city, state=:state, phone=:phone, email=:email";
        } else {
            $query = "INSERT INTO " . $this->table_name . " SET id=:id, name=:name";
        }

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->name = htmlspecialchars(strip_tags($this->name));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);

        if ($this->table_name === 'models') {
            $this->brand_id = htmlspecialchars(strip_tags($this->brand_id));
            $stmt->bindParam(":brand_id", $this->brand_id);
        } elseif ($this->table_name === 'workshops') {
            $stmt->bindParam(":manager_name", $this->manager_name);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":city", $this->city);
            $stmt->bindParam(":state", $this->state);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":email", $this->email);
        }

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function update() {
        if ($this->table_name === 'models') {
            $query = "UPDATE " . $this->table_name . " SET name=:name, brand_id=:brand_id WHERE id = :id";
        } elseif ($this->table_name === 'workshops') {
            $query = "UPDATE " . $this->table_name . " 
                     SET name=:name, manager_name=:manager_name, address=:address, 
                         city=:city, state=:state, phone=:phone, email=:email 
                     WHERE id = :id";
        } else {
            $query = "UPDATE " . $this->table_name . " SET name=:name WHERE id = :id";
        }

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->name = htmlspecialchars(strip_tags($this->name));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);

        if ($this->table_name === 'models') {
            $this->brand_id = htmlspecialchars(strip_tags($this->brand_id));
            $stmt->bindParam(":brand_id", $this->brand_id);
        } elseif ($this->table_name === 'workshops') {
            $stmt->bindParam(":manager_name", $this->manager_name);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":city", $this->city);
            $stmt->bindParam(":state", $this->state);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":email", $this->email);
        }

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