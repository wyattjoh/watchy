type Props = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function Widget({ title, icon, children }: Props) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2 text-gray-400">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
