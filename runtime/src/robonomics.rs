use rstd::vec::Vec;
#[cfg(feature = "std")]
use serde_derive::{Serialize, Deserialize};
use parity_codec::{Codec, Encode, Decode};
use system::ensure_signed;
use support::{
    StorageValue, StorageMap, Parameter,
    decl_module, decl_storage, decl_event, ensure,
    traits::{ReservableCurrency, Currency}, dispatch::Result
};
use runtime_primitives::traits::{Member, SimpleArithmetic, As, Hash};


/// Sensor message.
#[cfg_attr(feature = "std", derive(Serialize, Deserialize, Debug))]
#[derive(Encode, Decode, Clone, PartialEq, Eq)]
pub struct Sensor<AccountId> {
    pub fileHash: Vec<u8>,
    pub sender: AccountId,
}

type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as system::Trait>::AccountId>>::Balance;

pub trait Trait: system::Trait {
    /// Type used for storing an liability's index; implies the maximum number of liabilities
    /// the system can hold.
    type LiabilityIndex: Parameter + Member + Codec + Default + SimpleArithmetic + As<u8> + As<u16> + As<u32> + As<u64> + As<usize> + Copy;
    /// Payment currency; implies the processing token for liability contract.
    type Currency: ReservableCurrency<Self::AccountId>;
    /// The overarching event type.
    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin
    {
        pub fn sendData(
                    origin,
                    fileHash : Vec<u8>
        ) -> Result {
            let sender = ensure_signed(origin)?;
            let sensor = Sensor {fileHash, sender};
            let index = Self::sensor_count();
            <SensorOf<T>>::insert(index, sensor);
            <SensorCount<T>>::mutate(|v| *v += T::LiabilityIndex::sa(1));
            Ok(())
        }
    }
}

decl_storage! {
    trait Store for Module<T: Trait> as Robonomics {

        pub SensorOf get(sensor_of):
            map T::LiabilityIndex => Option<Sensor<T::AccountId>>;

        pub SensorCount get(sensor_count): T::LiabilityIndex;
    }
}

decl_event! {
    pub enum Event<T>  where <T as system::Trait>::AccountId
    {
        /// Someone wants a service.
        NewSensor(AccountId, Vec<u8>),
    }
}