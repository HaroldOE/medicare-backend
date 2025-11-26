import createConnection from "./db";


  
const db = await createConnection();

export const CreateMedTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS medicine (
        id INT AUTO_INCREMENT PRIMARY KEY,
        med_name VARCHAR(255),
        maunufacturer VARCHAR(255) ,
        batch_number VARCHAR(255),
        expiry_date VARCHAR(255),
        price INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
            `)
            console.log("medicine Table created Successfully");
    } catch (error) {
        console.error('error occured while creating medicine table', error)
    }
};

export const createMedicine = async (medicine) => {
    try {
        const {med_name, manufacturer, batch_number,expiry_date, price } = users;
        const query = `INSERT INTO users (med_name, manufacturer, batch_number,expiry_date, price) VALUES(?,?,?,?,?)`;
        // const hashedpassword = bcrypt.hash(password, 10);
        await db.query(query, [med_name, manufacturer, batch_number,expiry_date, price]);
        console.log("user created successfully");
    } catch (error) {
        console.error("an error occured creating user", medicine);
        throw error;
    }
};


export const findAllMedicine = async ()=>{
    try {
        const [row] = await db.query(`SELECT * FROM medicine`);
        console.log("all medicine found successfully");
        return row;
    } catch (error) {
        console.error("an error occurred fetching all medicine", error);
        throw error;
    }
};

export const getMedicineById = async (id) => {
    try {
        const [row] = await db.query(
            `SELECT * FROM medicine
            WHERE id = ?`,
            [id]
        );
        console.log("user id true")
        return row
    } catch (error) {
        console.error("an error occurred getting by id");
        throw error;
    }
}
  export const deleteMedicine = async (id) => {
    try {
       const [row] = await db.query(`
        DELETE  FROM medicine
        WHERE ID = ?`,
    [id]
);
    console.log("user deleted") 
    } catch (error) {
        console.error("an error occured deleting ")
        throw error;
    }
    
  }

  export const updateMedicine = async (id, updateMedicine) => {
    try {
        const {first_name, last_name, email} = updateMedicine;
        const query = `
        UPDATE medicine
        SET
        first_name = ?,
        last_name = ?,
        email = ?
        WHERE id = ?
        `;
        const user = [med_name, manufacturer, batch_number,expiry_date, price, id];
        const [results]= await db.query(query, user);
        console.log("user updated")
        return results;
    } catch (error) {
        console.error("an error occured updating");
        throw error;
        
    }
  };