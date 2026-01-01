1. New user login 
    - ask password from user.
    - gen salt key (used for password hashing)
    - hash password by salt and user id (used master key encryption)
    - gen recovery key. 
    - hash recovery key by salt and user id (used master key encryption)
    - gen master key (used for data encryption)
    - encrypt masterKey by hashedPassword
    - encrypt masterKey by hashedRecoverykey
    - encrypt userid with master key

-- store in db (meta data)
    - used id
    - salt key 
    - encryptedMasterKeyByPassword 
    - encryptedMasterKeyByRecoveryKey
    - encryptedUserID
-- for user 
    - remember password 
    - save recovery key


3. login 
 - fetch user meta data (if no meta data then route to singup)
 - Ask for password 
 - genPasswordHash by password , salt , userId
 - decript encryptedMasterKeyByPassword by password hash, 
 - decript encryptedUserID by master key
 - if decript success store masterKey in-memory (used for data decription)
   - else wrong passwrod 
    - Ask for re-enter passwrod/ recovery key, repead the same. (decript encryptedMasterKeyByPassword or encryptedMasterKeyByRecoveryKey based on input)

4. write vault data 
    - encrypt data by master key before save. 

5. read vault data 
    - decript data by master key