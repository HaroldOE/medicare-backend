import { createMedicine, findAllMedicine, deleteUser, getUserById, updateUser } from "../model/medicine.model.js";

export const medicineController = async (req, res) => {

    try {
        const { med_name, manufacturer, batch_number,expiry_date,price} = req.body;

        if( !med_name || !manufacturer || !batch_number,expiry_date,price){
            return res.status(400).json({
                message: "all fields are required", });
        }
        await createMedicine({med_name, manufacturer, batch_number,expiry_date,price});
        console.log("medicine created successfully");
        return res.status(200).json({
            success : true,
            message: "medicine created successfully"
    })
    } catch (error) {
        console.error("an error occurred creating medicine", error);
        return res.status(500).json({
            success: false,
            message:"an error occured creating medicine",
            error: error.message
        })
    }
};

export const findAllMedicineController = async (req, res)=> {
    try {
       const allMedicine = await getMedicine();
       console.log("all medicine fetched");
       return res.status(200).json({
        success : true,
        message: "all medicine fetched successfully",
        data: allMedicine,
       })
    } catch (error) {
        console.error("an error occured fetching users", error);
        return res.status(500).json({
            success: false,
            message: "error in getting all users",
            error : error.message,
        });
    }
};

export const getUserByIdController = async (req, res) => {

    try {
        const {id}= req.params;
        if(!id){
            return res.status(404).json({
                success: false,
                message: "user id required",

            });
        }
        const user = await getUserById(id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "no exist user with id" + user_id
            });
        }
        console.log("user found by id");
        return res.status(200).json({
            success: true,
            message:"user found",
            data: user,
        });
    } catch (error) {
        console.error("an error occured getting user by id".error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const deleteUserController = async(req, res) =>{
    try {
        const {id} = req.params;
        const user = await getUserById(id);
        if(!user)
            return res.status(404).json({
        message: "user does not exist"});

        await deleteUser(id)
        return res.status(200).json({
            message:"user deleted"
        })
    } catch (error) {
        console.error("an  error occurred", error)
        return res.status(500).json({
            success: false,
            message:error.message})
    }
}

export const updateUserController = async(req, res)=>{
    try {
        const {id} = req.params;
        const {first_name, last_name, email} = req.body;
        if(!first_name || !last_name || !email){
            return res.status(500).json({
                success: false,
                message:"all field are required"
            })
        };

        const update = {first_name, last_name, email};
        const results = await updateUser(id, update);
        return res.status(200).json({
            success: true,
            message: "user updated",
            results,
        });
    } catch (error) {
        console.error("error updating user", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};