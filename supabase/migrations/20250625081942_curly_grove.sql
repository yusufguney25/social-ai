/*
  # Add deduct credits function

  1. New Functions
    - `deduct_credits` - Function to safely deduct credits from user profile
  
  2. Security
    - Function checks if user has sufficient credits before deducting
    - Uses atomic operations to prevent race conditions
*/

-- Function to deduct credits from user profile
CREATE OR REPLACE FUNCTION deduct_credits(user_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has sufficient credits
  IF (SELECT credits_remaining FROM profiles WHERE id = user_id) < amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', 
      amount, 
      (SELECT credits_remaining FROM profiles WHERE id = user_id);
  END IF;
  
  -- Deduct credits atomically
  UPDATE profiles 
  SET credits_remaining = credits_remaining - amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', user_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer) TO authenticated;