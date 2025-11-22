import React from 'react'

function Button({
    children,
    type='button',
    bgColor='bg-blue-600',
    textColour='text-white',
    className='',
    ...props
}) {
  return (
    <button type={type} className={`inline-block px-6 py-2 ${bgColor} ${textColour} ${className}`}  {...props}>
        {children}
    </button>
  )
}

export default Button
